using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AqarCare.Services;

public class AIBrokerService
{
    private readonly AqarCareDbContext _db;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AIBrokerService> _logger;

    private static readonly Regex PropertiesTagRegex = new(@"\[PROPERTIES:\s*([0-9,\s]+)\]", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static int _keyCounter = 0;

    public AIBrokerService(
        AqarCareDbContext db,
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<AIBrokerService> logger)
    {
        _db = db;
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AIBrokerResponse> GetBrokerReplyAsync(AIBrokerRequest request, CancellationToken ct = default)
    {
        var apiKeys = GetAvailableApiKeys();
        var model = _configuration["Groq:Model"]?.Trim();
        if (string.IsNullOrWhiteSpace(model)) model = "openai/gpt-oss-120b";
        var maxTokens = _configuration.GetValue<int?>("Groq:MaxTokens") ?? 750;
        var temperature = _configuration.GetValue<double?>("Groq:Temperature") ?? 0.6;

        if (!apiKeys.Any())
        {
            _logger.LogWarning("No valid Groq API Keys are configured.");
            return new AIBrokerResponse(
                "أهلاً بحضرتك يا فندم! المساعد الذكي قيد التجهيز حالياً، لكن تقدر تتواصل معانا فوراً عبر الواتساب لمعرفة كافة التفاصيل ومساعدتك في اختيار العقار المناسب.",
                Array.Empty<int>(),
                Array.Empty<PropertyListItemDto>()
            );
        }

        // 1. Fetch published properties
        var properties = await _db.PropertyUnits
            .AsNoTracking()
            .Include(x => x.Floors)
            .Include(x => x.Media)
            .Where(x => x.IsPublished)
            .ToListAsync(ct);

        // 2. Build Inventory Context
        var inventoryBuilder = new StringBuilder();
        inventoryBuilder.AppendLine("قائمة العقارات المتاحة حالياً في قاعدة بيانات AqarCare:");
        foreach (var p in properties)
        {
            var floorsSummary = p.Floors != null && p.Floors.Any()
                ? string.Join(", ", p.Floors.Where(f => f.IsAvailable).Select(f => $"{FormatFloorDisplay(f)} (سعر: {(f.Price.HasValue ? f.Price.Value.ToString("N0") + " ج" : "غير محدد")}, م²: {(f.PricePerMeter.HasValue ? f.PricePerMeter.Value.ToString("N0") : "غير محدد")})"))
                : "غير مقسم لأدوار";

            var priceStr = p.Price.HasValue ? $"{p.Price.Value:N0} ج.م" : "غير محدد";
            var installmentStr = p.InstallmentAvailable
                ? (p.InstallmentPrice.HasValue && (!p.Price.HasValue || p.InstallmentPrice.Value < p.Price.Value)
                    ? $"متاح تقسيط (مقدم يبدأ من: {p.InstallmentPrice.Value:N0} ج مع إمكانية جدولة الباقي)"
                    : "متاح تقسيط وتسهيلات سداد مرنة حسب الاتفاق")
                : "كاش فقط";

            var finishingArabic = FormatFinishingArabic(p.FinishingStatus);
            var typeArabic = FormatPropertyTypeArabic(p.PropertyType);
            var listingArabic = FormatListingTypeArabic(p.ListingType);
            var streetAnalysis = AnalyzeStreetLocation(p.Title, p.Address, p.DetailedAddress, p.Description, p.StreetWidth);
            var districtArabic = (p.District == "منشية البكري" || (p.Title != null && p.Title.Contains("الشعبية")) || (p.Address != null && p.Address.Contains("الشعبية")))
                ? "منشية البكري (الشعبية)"
                : (p.District ?? "المحلة الكبرى");
            var constructionStatus = p.IsUnderConstruction ? "تحت الإنشاء (برج تحت الإنشاء)" : "مبني وجاهز للتسليم";

            inventoryBuilder.AppendLine(
                $"- [عقار #{p.Id}]: العنوان: \"{p.Title}\" | النوع: {typeArabic} ({listingArabic}) | الحي/المنطقة: {districtArabic}، {p.City} | العنوان بالتفصيل: {p.Address} {p.DetailedAddress} | {streetAnalysis} | حالة البناء: {constructionStatus} | المساحة: {p.AreaSqm}م² | السعر: {priceStr} | نظام الدفع: {installmentStr} | التشطيب: {finishingArabic} | الغرف: {p.Bedrooms} | الحمامات: {p.Bathrooms} | المصعد: {(p.ElevatorAvailable ? "يوجد أسانسير" : "بدون")} | العدادات: {(p.ElectricityMeterAvailable ? "كهرباء " : "")}{(p.WaterMeterAvailable ? "مياه " : "")}{(p.GasMeterAvailable ? "غاز" : "")} | الأدوار والوحدات المتاحة: [{floorsSummary}] | نبذة: {p.Description}"
            );
        }

        // 3. Formulate System Prompt
        var systemPrompt = $@"أنت 'مستشارك العقاري' - بائع وبروكر عقاري مصري محترف ومقنع جداً وخبير بالسوق العقاري في المحلة الكبرى لدى منصة AqarCare (عقار كير).

معلومات جغرافية وسوقية جوهرية بالمحلة الكبرى:
1. (الشعبية = منشية البكري): في المحلة الكبرى هما نفس المنطقة والحي تماماً ويُطلق الاسمان بالتبادل! إذا طلب العميل الشعبية أو منشية البكري، فكافة العقارات المتاحة تلبي طلبه مباشرة، وإياك أن تفرّق بينهما!
2. (العمومي vs الجانبي): الشارع العمومي (مثل المأمون والصفوة وجمال عبد الناصر) أعلى سعراً لواجهته وحركته التجارية، أما الجانبي وثاني نمرة (مثل جانبي جمال عبد الناصر محطة المنار، وثاني نمرة الفلل) فميزته البيعية هي الهدوء وتوفير ضخم بسعر المتر (حوالي 10 آلاف ج/م² مقابل 18-20 ألف على العمومي).

استراتيجية الرد حسب رسالة العميل الأخيرة:
1. عند السؤال عن التفاوض أو الخصم أو تنزيل السعر (مثل: 'هل ممكن ينزل لمليون؟' أو 'في تفاوض؟'):
   - هذا أهم سؤال لإغلاق البيعة! ردك يجب أن يبدأ فوراً وبحماس وثقة بتأكيد إمكانية التفاوض:
   - إذا كان الخصم المطلوب في حدود 10% إلى 15% من السعر (مثل طلب مليون في شقة 1,150,000 ج = خصم 13%):
     أكد له فوراً: ""التفاوض متاح ومرن جداً يا فندم طالما في حدود 10% لـ 15%! وأنا كوسيط ومستشارك العقاري هكون في صفك ومعاك في الجلسة مع المطور وهنجيبلك أحسن سعر وتسهيلات ترضيك"".
   - ثم ادعه فوراً لحسم هذا السعر بالمعاينة: ""أهم خطوة دلوقتي عشان نقفل بالسعر ده نحدد ميعاد ننزل سوا نعاين الشقة على الطبيعة ونقعد مع المطور ونخلص البيعة. قولي إيه اليوم اللي يناسبك هذا الأسبوع؟""
   - إذا طلب خصماً مبالغاً فيه (> 15% إلى 20%): وضّح بلباقة أن هامش المطور وتكلفة الإنشاء لا تسمح بذلك، واقترح فوراً البديل الأصغر المطابق لميزانيته من القائمة (مثل الشقة 85م² بـ 850 ألف مع إمكانية تفاوض تنزل بها لـ 750-800 ألف).
   - ممنوع تكرار مواصفات الشقة بالكامل من جديد! أجب عن التفاوض وركز على حجز موعد المعاينة.

2. عند السؤال عن مرحلة البناء أو تاريخ التسليم أو الأدوار (مثل: 'اتبنى فيها قد إيه؟' أو 'الشقق دي في الدور الكام؟'):
   - التزم التزاماً صارماً ببيانات العقار: الوحدات المتاحة هي في الأدوار المذكورة بالبيانات (مثلاً في عقار #14: الأدوار 7 و 10 و 11)، والتشطيب عظم على الطوب الأحمر مع توفر أسانسير ومرافق.
   - وضّح أن البرج حالياً تحت الإنشاء، وأفضل خطوة هي النزول لموقع البناء على الطبيعة لرؤية نسبة الإنجاز وجودة الصب والجدول الزمني مع المطور.
   - ممنوع منعاً باتاً اختراع أرقام أدوار من خيالك كالدور الرابع أو الخامس!

3. عند بداية المحادثة أو البحث الجديد عن شقق وميزانية:
   - اعرض فوراً أفضل 1 إلى 2 وحدة مطابقة من القائمة أدناه مع السعر والمساحة وموقع الشارع والوفر، ثم اسأله عن رأيه فيها وادعه للمعاينة.

قواعد عامة وإلزامية:
- تحدث بلهجة مصرية راقية وودودة ومقنعة (يا فندم، يا باشا، تحت أمرك).
- ممنوع منعاً باتاً أي مصطلحات إنجليزية مثل Core-Shell! استخدم: (عظم على الطوب الأحمر / نصف تشطيب / لوكس).
- لا تشتت العميل بعرض عقارات جديدة إذا كان يسأل عن تفاصيل عقار سبق ذكره في المحادثة.
- ردك يجب أن يكون مركزاً وسريعاً وجذاباً (في حدود 70 إلى 130 كلمة) لكي تكتمل رسالتك بدون انقطاع.
- عند ترشيح أي عقار للعميل في ردك:
  1. اعرض تفاصيل الوحدات والأسعار والمميزات أولاً.
  2. ضع التاج الإلزامي للعقارات:
[PROPERTIES: id1, id2]
  3. بعد التاج مباشرة، اكتب سؤال المتابعة الختامي الموجه للعميل (مثلاً: 'إيه رأي حضرتك في الخيارات دي؟ وهل ده مناسب لطلبك؟ تحب نحدد ميعاد ننزل نعاين على الطبيعة؟') لكي يظهر للعميل كرسالة تالية مباشرة بعد كروت العقارات!

{inventoryBuilder}";

        // 4. Build Messages for Groq API
        var groqMessages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

        // Take last 14 messages to maintain rich conversation memory and context
        var recentMessages = (request.Messages ?? Array.Empty<ChatMessageDto>())
            .TakeLast(14)
            .ToList();

        foreach (var msg in recentMessages)
        {
            var role = msg.Role.ToLowerInvariant() switch
            {
                "assistant" => "assistant",
                _ => "user"
            };
            groqMessages.Add(new { role, content = msg.Content });
        }

        // 5. Call Groq with Multi-Key Rotation
        string replyText;
        try
        {
            replyText = await ExecuteGroqWithKeyRotationAsync(apiKeys, model, groqMessages, maxTokens, temperature, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "All Groq API keys failed for primary model {Model}. Attempting fallback model...", model);
            try
            {
                replyText = await ExecuteGroqWithKeyRotationAsync(apiKeys, "openai/gpt-oss-20b", groqMessages, Math.Min(maxTokens, 450), temperature, ct);
            }
            catch
            {
                return new AIBrokerResponse(
                    "أهلاً بحضرتك يا فندم! معلش حصل ضغط لحظي في الشبكة، بس أنا تحت أمرك دايماً. إيه الميزانية والمكان المناسب ليك في المحلة وأنا هساعدك في اختيار أنسب شقة فوراً؟",
                    Array.Empty<int>(),
                    Array.Empty<PropertyListItemDto>()
                );
            }
        }

        // 6. Parse [PROPERTIES: id1, id2] tag and separate followUpMessage
        var recommendedIds = new List<int>();
        string? followUpMessage = null;
        var match = PropertiesTagRegex.Match(replyText);
        if (match.Success)
        {
            var idsStr = match.Groups[1].Value;
            var parts = idsStr.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var part in parts)
            {
                if (int.TryParse(part, out var id) && !recommendedIds.Contains(id))
                {
                    recommendedIds.Add(id);
                }
            }

            var beforeTag = replyText.Substring(0, match.Index).Trim();
            var afterTag = replyText.Substring(match.Index + match.Length).Trim();

            replyText = beforeTag;
            if (!string.IsNullOrWhiteSpace(afterTag))
            {
                followUpMessage = afterTag;
            }
        }

        // Fallback: if tag was omitted or truncated, detect mentioned property IDs (e.g. "عقار #11" or "#12")
        if (!recommendedIds.Any())
        {
            var mentionMatches = Regex.Matches(replyText, @"(?:عقار|العقار)?\s*#(\d+)", RegexOptions.IgnoreCase);
            foreach (Match m in mentionMatches)
            {
                if (int.TryParse(m.Groups[1].Value, out var id) && !recommendedIds.Contains(id) && properties.Any(p => p.Id == id))
                {
                    recommendedIds.Add(id);
                }
            }
        }

        // When properties are recommended, ensure a closing follow-up question is separated after the cards
        if (recommendedIds.Any())
        {
            if (string.IsNullOrWhiteSpace(followUpMessage))
            {
                // If replyText ends with a closing question, split it into followUpMessage so it appears after the cards
                var questionMatch = Regex.Match(replyText, @"(?:\r?\n)+(إيه رأي(?:ك| حضرتك)[\s\S]*|تحب[\s\S]*|هل (?:تحب|يناسبك)[\s\S]*|قوللي[\s\S]*|شايف[\s\S]*)$", RegexOptions.IgnoreCase);
                if (questionMatch.Success && questionMatch.Index > 20)
                {
                    followUpMessage = questionMatch.Value.Trim();
                    replyText = replyText.Substring(0, questionMatch.Index).Trim();
                }
                else
                {
                    followUpMessage = "إيه رأي حضرتك في الخيارات المعروضة دي؟ وهل ده مناسب لطلبك؟ تحب نحدد ميعاد ننزل نعاين على الطبيعة؟ 🤝";
                }
            }
        }

        // 7. Get Recommended Property Cards
        var recommendedProperties = properties
            .Where(p => recommendedIds.Contains(p.Id))
            .Select(PropertyService.ToListItem)
            .ToList();

        return new AIBrokerResponse(replyText, recommendedIds, recommendedProperties, followUpMessage);
    }

    private List<string> GetAvailableApiKeys()
    {
        var keys = new List<string>();

        // 1. Environment variables
        var envKeys = Environment.GetEnvironmentVariable("GROQ_API_KEYS");
        if (!string.IsNullOrWhiteSpace(envKeys))
        {
            keys.AddRange(envKeys.Split(new[] { ',', ';', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
        }

        var envKey = Environment.GetEnvironmentVariable("GROQ_API_KEY");
        if (!string.IsNullOrWhiteSpace(envKey))
        {
            keys.Add(envKey.Trim());
        }

        // 2. Configuration: Groq:ApiKeys (array)
        var configKeys = _configuration.GetSection("Groq:ApiKeys").Get<string[]>();
        if (configKeys != null)
        {
            keys.AddRange(configKeys.Where(k => !string.IsNullOrWhiteSpace(k)).Select(k => k.Trim()));
        }

        // 3. Configuration: Groq:ApiKey (single)
        var singleKey = _configuration["Groq:ApiKey"]?.Trim();
        if (!string.IsNullOrWhiteSpace(singleKey))
        {
            keys.Add(singleKey);
        }

        // Deduplicate and filter out placeholders
        return keys
            .Where(k => !string.IsNullOrWhiteSpace(k) && !k.StartsWith("YOUR_", StringComparison.OrdinalIgnoreCase))
            .Distinct(StringComparer.Ordinal)
            .ToList();
    }

    private async Task<string> ExecuteGroqWithKeyRotationAsync(
        List<string> keys,
        string model,
        List<object> messages,
        int maxTokens,
        double temperature,
        CancellationToken ct)
    {
        if (!keys.Any())
        {
            throw new InvalidOperationException("No valid Groq API keys available.");
        }

        var startIndex = (int)((uint)Interlocked.Increment(ref _keyCounter) % (uint)keys.Count);
        Exception? lastException = null;

        for (int i = 0; i < keys.Count; i++)
        {
            var currentIndex = (startIndex + i) % keys.Count;
            var key = keys[currentIndex];
            var keyMask = key.Length > 10 ? key[..6] + "..." + key[^4..] : "***";

            try
            {
                return await CallGroqApiAsync(key, model, messages, maxTokens, temperature, ct);
            }
            catch (Exception ex)
            {
                lastException = ex;
                _logger.LogWarning(ex, "Groq call with key #{Index} ({KeyMask}) failed for model {Model}. Rotating to next key in pool...", currentIndex + 1, keyMask, model);
            }
        }

        throw lastException ?? new InvalidOperationException("All Groq API keys failed.");
    }

    private async Task<string> CallGroqApiAsync(
        string apiKey,
        string model,
        List<object> messages,
        int maxTokens,
        double temperature,
        CancellationToken ct)
    {
        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var payload = new
        {
            model,
            messages,
            max_tokens = maxTokens,
            temperature
        };

        var json = JsonSerializer.Serialize(payload);
        requestMessage.Content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(requestMessage, ct);
        var responseBody = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Groq API returned error status {StatusCode}: {ResponseBody}", response.StatusCode, responseBody);
            throw new InvalidOperationException($"Groq API failed: {response.StatusCode} - {responseBody}");
        }

        using var doc = JsonDocument.Parse(responseBody);
        var root = doc.RootElement;
        if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var messageProp) &&
                messageProp.TryGetProperty("content", out var contentProp))
            {
                return contentProp.GetString() ?? string.Empty;
            }
        }

        return string.Empty;
    }

    private static string FormatFloorDisplay(PropertyFloor f)
    {
        var floorNumStr = f.FloorNumber switch
        {
            71011 => "الأدوار (7 و 10 و 11)",
            _ when f.FloorNumber.HasValue => $"الدور {f.FloorNumber.Value}",
            _ => ""
        };

        if (!string.IsNullOrWhiteSpace(f.FloorName) && !string.IsNullOrWhiteSpace(floorNumStr))
        {
            return $"{floorNumStr} - {f.FloorName}";
        }

        if (!string.IsNullOrWhiteSpace(f.FloorName))
        {
            return f.FloorName;
        }

        return !string.IsNullOrWhiteSpace(floorNumStr) ? floorNumStr : "دور غير محدد";
    }

    private static string FormatFinishingArabic(string? status) => status switch
    {
        "Core-Shell" => "عظم (على الطوب)",
        "Semi-Finished" => "نصف تشطيب",
        "Finished" => "تشطيب كامل",
        "Lux" => "لوكس",
        "Super-Lux" => "سوبر لوكس",
        "High-Lux" => "هاي لوكس",
        _ => status ?? "غير محدد"
    };

    private static string FormatPropertyTypeArabic(string? type) => type switch
    {
        "Apartment" => "شقة",
        "House" or "Villa" => "بيت",
        "Land" => "أرض",
        "Shop" => "محل",
        _ => type ?? "عقار"
    };

    private static string FormatListingTypeArabic(string? type) => type switch
    {
        "Sale" => "للبيع",
        "Rent" => "للإيجار",
        _ => type ?? ""
    };

    private static string AnalyzeStreetLocation(string? title, string? address, string? detailedAddress, string? description, string? streetWidth)
    {
        var text = $"{title} {address} {detailedAddress} {description}".ToLowerInvariant();

        if (text.Contains("تاني نمرة") || text.Contains("ثاني نمرة") || text.Contains("تاني نمره"))
        {
            return "موقع الشارع: ثاني نمرة من شارع رئيسي عمومي (يجمع بين السعر الموفر جداً والهدوء، والقرب لثواني من الرئيسي)";
        }

        if (text.Contains("جانبي") || text.Contains("متفرع من") || text.Contains("شارع جانبي"))
        {
            return "موقع الشارع: شارع جانبي متفرع من رئيسي (يتميز بالهدوء السكني، والخصوصية، وسعر متر اقتصادي وموفر جداً مقارنة بالعمومي)";
        }

        if (text.Contains("المأمون") || text.Contains("الصفوة") || text.Contains("عمومي") || text.Contains("رئيسي"))
        {
            return "موقع الشارع: شارع رئيسي / حيوي (حركة تجارية، سهولة مواصلات، واجهة مميزة، وقيمة استثمارية أعلى)";
        }

        return !string.IsNullOrWhiteSpace(streetWidth)
            ? $"عرض الشارع: {streetWidth}م"
            : "موقع الشارع: شارع سكني هادئ";
    }
}


