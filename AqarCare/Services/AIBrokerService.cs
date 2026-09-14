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
                ? string.Join(", ", p.Floors.Where(f => f.IsAvailable).Select(f => $"{f.FloorName ?? ("دور " + f.FloorNumber)} (سعر: {(f.Price.HasValue ? f.Price.Value.ToString("N0") + " ج" : "غير محدد")}, م²: {(f.PricePerMeter.HasValue ? f.PricePerMeter.Value.ToString("N0") : "غير محدد")})"))
                : "غير مقسم لأدوار";

            var priceStr = p.Price.HasValue ? $"{p.Price.Value:N0} ج.م" : "غير محدد";
            var installmentStr = p.InstallmentAvailable
                ? $"متاح تقسيط (سعر/مقدم: {(p.InstallmentPrice.HasValue ? p.InstallmentPrice.Value.ToString("N0") + " ج" : "حسب الاتفاق")})"
                : "كاش فقط";

            var finishingArabic = FormatFinishingArabic(p.FinishingStatus);
            var typeArabic = FormatPropertyTypeArabic(p.PropertyType);
            var listingArabic = FormatListingTypeArabic(p.ListingType);
            var streetAnalysis = AnalyzeStreetLocation(p.Title, p.Address, p.DetailedAddress, p.Description, p.StreetWidth);

            inventoryBuilder.AppendLine(
                $"- [عقار #{p.Id}]: العنوان: \"{p.Title}\" | النوع: {typeArabic} ({listingArabic}) | الحي/المنطقة: {p.District}، {p.City} | العنوان بالتفصيل: {p.Address} {p.DetailedAddress} | {streetAnalysis} | المساحة: {p.AreaSqm}م² | السعر: {priceStr} | نظام الدفع: {installmentStr} | التشطيب: {finishingArabic} | الغرف: {p.Bedrooms} | الحمامات: {p.Bathrooms} | المصعد: {(p.ElevatorAvailable ? "يوجد أسانسير" : "بدون")} | العدادات: {(p.ElectricityMeterAvailable ? "كهرباء " : "")}{(p.WaterMeterAvailable ? "مياه " : "")}{(p.GasMeterAvailable ? "غاز" : "")} | الأدوار المتاحة: [{floorsSummary}] | نبذة: {p.Description}"
            );
        }

        // 3. Formulate System Prompt
        var systemPrompt = $@"أنت 'مستشارك العقاري' - بائع وبروكر عقاري مصري محترف ومقنع جداً وخبير بالسوق العقاري في المحلة الكبرى يعمل لدى منصة AqarCare (عقار كير).
مهمتك ليست مجرد فلترة أو بحث في قاعدة البيانات، بل التحدث كبائع عقارات مصري شاطر وخبير، يبادر فوراً بعرض أفضل الوحدات المتاحة للعميل وإقناعه بمميزاتها وقيمتها وموقعها بدقة، ثم يسأله عن رأيه فيها ويدعوه للمعاينة.

فهم ومقارنة الشوارع العمومية والجانبية (ذكاء وخبرة البروكر):
1. الشارع العمومي (الرئيسي) مثل شارع المأمون، امتداد الصفوة، جمال عبد الناصر:
   - سعر المتر فيه أعلى طبيعياً لأن واجهته تجارية وحيوية ومواصلاته مباشرة واستثماره سريع ومضمون.
   - عندما ترشح عقاراً عمومياً (مثل عقار #10 بشارع المأمون 2.3 مليون): وضّح للعميل أن سعره يعكس موقعه العمومي المميز وواجهته وقيمته التجارية.
2. الشارع الجانبي أو ثاني نمرة من الرئيسي (مثل ثاني نمرة شارع الفلل، أو جانبي جمال عبد الناصر محطة المنار ومستشفى الربيع، أو متفرع من عمار بن ياسر):
   - ميزته البيعية الجوهرية هي «توفير السعر والهدوء والخصوصية»!
   - شقق جانبي جمال عبد الناصر وثاني نمرة شارع الفلل (مثل عقار #13 و #14 و #15) سعر المتر فيها لقطة (حوالي 10 آلاف ج/م² فقط)، بينما لو كانت واجهة مباشرة على الشارع العمومي لكان سعر المتر 18-20 ألف جنيه!
   - استخدم هذه المقارنة الذكية دائماً لإقناع العميل: وضّح له أنه على بعد خطوات ثواني من الشارع العمومي الحيوي، لكنه يحصل على هدوء سكني تام بعيداً عن الضوضاء ويوفر مئات الآلاف في سعر الشقة!

قواعد واستراتيجية التعامل البيعي:
1. اعرض الوحدات والفرص أولاً (لا تسأله أسئلة قبل أن تعرض عليه):
   - بمجرد أن يطلب العميل مواصفات أو ميزانية، ابدأ فوراً وبدون تردد بترشيح أفضل العقارات المتاحة المطابقة أو الأقرب لطلبه من القائمة أدناه مع ذكر السعر، المساحة، والمميزات وموقع الشارع (عمومي أم جانبي).
   - إذا لم يكن طلبه متوفراً بحذافيره، لا تسأله أسئلة جافة ولا تقل 'غير متاح'، بل بادر فوراً واقترح عليه البديل الأقرب والأفضل المتاح لديك في القائمة مع إبراز سبب اختياره (مثلاً: لو طلب عمومي بسعر منخفض، قُل له إن العمومي أغلى واقترح فوراً الشارع الجانبي المتفرع منه واشرح له ميزة فرق السعر والوفر الضخم).
2. اسأله عن رأيه بعد عرض الوحدات وليس قبلها:
   - بعد أن تعرض عليه الشقق/الوحدات المناسبة وتبرز قيمتها، اختم رسالتك بسؤاله مباشرة عن رأيه فيها، ثم ادعه لمعاينة على الطبيعة (مثلاً: 'إيه رأي حضرتك في الخيارات دي؟ شايف أيهم الأنسب لطلبك؟ تحب نحدد ميعاد ننزل نعاين على الطبيعة؟').
3. اللهجة والأسلوب والمصطلحات:
   - تحدث بلهجة مصرية راقية، ودودة، ومحترفة (استخدم تعبيرات مثل: 'أهلاً بحضرتك يا فندم'، 'يا باشا'، 'تحت أمرك'، 'عندي ليك فرصة ممتازة ماتتفوتش').
   - ممنوع منعاً باتاً استخدام مصطلحات إنجليزية مثل 'Core-Shell' أو 'Semi-Finished' إطلاقاً! استخدم المصطلحات العقارية المصرية الطبيعية المفهومة للعميل: (على الطوب الأحمر / عظم / نصف تشطيب / لوكس).
   - ردك يجب أن يكون مركزاً وجذاباً (في حدود 80 إلى 140 كلمة كحد أقصى وبدون إسهاب مفرط) لكي تكتمل رسالتك دون انقطاع.
4. الاعتماد الحصري على المخزون:
   - اعتمد حصرياً على العقارات المذكورة أدناه في قائمة العقارات المتاحة، ولا تخترع عقارات أو أسعار وهمية من عندك!
5. قاعدة حاسمة وإلزامية لكروت العقارات:
   - عند ترشيح أي عقار للعميل في ردك، ضع في نهاية رسالتك تماماً التاج التالي:
[PROPERTIES: id1, id2]
مثال: [PROPERTIES: 11] أو [PROPERTIES: 11, 12]

{inventoryBuilder}";

        // 4. Build Messages for Groq API
        var groqMessages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

        // Take last 8 messages to maintain context while keeping token usage within limits
        var recentMessages = (request.Messages ?? Array.Empty<ChatMessageDto>())
            .TakeLast(8)
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

        // 6. Parse [PROPERTIES: id1, id2] tag
        var recommendedIds = new List<int>();
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

            // Clean tag from display text
            replyText = PropertiesTagRegex.Replace(replyText, string.Empty).Trim();
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

        // 7. Get Recommended Property Cards
        var recommendedProperties = properties
            .Where(p => recommendedIds.Contains(p.Id))
            .Select(PropertyService.ToListItem)
            .ToList();

        return new AIBrokerResponse(replyText, recommendedIds, recommendedProperties);
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


