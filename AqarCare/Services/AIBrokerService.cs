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
        var primaryModel = _configuration["Groq:Model"]?.Trim();
        if (string.IsNullOrWhiteSpace(primaryModel)) primaryModel = "qwen/qwen3.8-27b";
        var maxTokens = _configuration.GetValue<int?>("Groq:MaxTokens") ?? 400;
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
            .Where(x => x.IsPublished && (x.Status == "Available" || x.Status == "available"))
            .ToListAsync(ct);

        // 2. Build Inventory Context (Compact, Multi-Unit & Area Aware)
        var inventoryBuilder = new StringBuilder();
        inventoryBuilder.AppendLine("قائمة العقارات والوحدات المتاحة حالياً في قاعدة بيانات AqarCare:");
        foreach (var p in properties)
        {
            var isHouse = p.PropertyType == "House" || p.PropertyType == "Villa";
            var availFloors = p.Floors?.Where(f => f.IsAvailable).ToList() ?? new List<PropertyFloor>();

            // Distinct unit areas available in this property
            var distinctAreas = availFloors
                .Where(f => f.AreaSqm.HasValue && f.AreaSqm.Value > 0)
                .Select(f => f.AreaSqm!.Value)
                .Distinct()
                .OrderBy(a => a)
                .ToList();

            string areaStr;
            if (distinctAreas.Count > 1)
            {
                areaStr = $"مساحات: {string.Join("م² و ", distinctAreas.Select(a => $"{a:N0}"))}م²";
            }
            else if (distinctAreas.Count == 1)
            {
                areaStr = $"{distinctAreas[0]:N0}م²";
            }
            else
            {
                areaStr = $"{p.AreaSqm:N0}م²";
            }

            // Price range
            var availPrices = availFloors
                .Where(f => f.Price.HasValue && f.Price.Value > 0)
                .Select(f => f.Price!.Value)
                .ToList();

            string priceStr;
            if (availPrices.Any())
            {
                var minPrice = availPrices.Min();
                var maxPrice = availPrices.Max();
                priceStr = minPrice == maxPrice
                    ? $"{minPrice:N0}ج"
                    : $"من {minPrice:N0}ج إلى {maxPrice:N0}ج";
            }
            else if (p.Price.HasValue)
            {
                priceStr = $"{p.Price.Value:N0}ج";
            }
            else
            {
                priceStr = "غير محدد";
            }

            // Floors & individual units breakdown
            string floorsSummary;
            if (isHouse)
            {
                floorsSummary = $"البيت يباع بالكامل كوحدة واحدة ({p.Floors?.Count ?? 1} أدوار)";
            }
            else if (availFloors.Any())
            {
                var floorGroups = availFloors.GroupBy(f => f.FloorNumber);
                var groupList = new List<string>();

                foreach (var grp in floorGroups)
                {
                    var floorNum = grp.Key;
                    var floorLabel = floorNum switch
                    {
                        71011 => "الأدوار (7 و 10 و 11)",
                        _ when floorNum.HasValue => $"الدور {floorNum.Value}",
                        _ => grp.First().FloorName ?? "دور غير محدد"
                    };

                    var unitsInFloor = grp.Select((f, idx) =>
                    {
                        var areaPart = f.AreaSqm.HasValue ? $"{f.AreaSqm.Value:N0}م²" : "";
                        var pricePart = f.Price.HasValue ? $"{f.Price.Value:N0}ج" : "";
                        var details = string.Join(" بـ ", new[] { areaPart, pricePart }.Where(s => !string.IsNullOrEmpty(s)));

                        var unitLabel = grp.Count() > 1
                            ? (f.FloorName != null && f.FloorName.Contains("شقة") ? f.FloorName : $"شقة {idx + 1}")
                            : "";

                        return !string.IsNullOrEmpty(unitLabel) ? $"{unitLabel} ({details})" : details;
                    });

                    groupList.Add($"{floorLabel}: {string.Join("، ", unitsInFloor)}");
                }

                floorsSummary = string.Join(" | ", groupList);
            }
            else
            {
                floorsSummary = "غير مقسم لأدوار";
            }

            var installmentStr = p.InstallmentAvailable
                ? (p.InstallmentPrice.HasValue && (!p.Price.HasValue || p.InstallmentPrice.Value < p.Price.Value)
                    ? $"متاح تقسيط بمقدم يبدأ من {p.InstallmentPrice.Value:N0}ج"
                    : "متاح تقسيط")
                : "كاش فقط";

            var finishingArabic = FormatFinishingCompact(p.FinishingStatus);
            var typeArabic = FormatPropertyTypeArabic(p.PropertyType);
            var listingArabic = FormatListingTypeArabic(p.ListingType);
            var districtArabic = (p.District == "منشية البكري" || (p.Title != null && p.Title.Contains("الشعبية")) || (p.Address != null && p.Address.Contains("الشعبية")))
                ? "منشية البكري (الشعبية)"
                : (p.District ?? "المحلة الكبرى");
            var streetLoc = GetCompactStreet(p.Title, p.Address, p.DetailedAddress);
            var constructionStatus = p.IsUnderConstruction ? "تحت الإنشاء" : "مبنى جاهز";
            var elevator = p.ElevatorAvailable ? "يوجد أسانسير" : "بدون أسانسير";

            inventoryBuilder.AppendLine(
                $"- [عقار #{p.Id}]: {typeArabic} {listingArabic} | {districtArabic} ({streetLoc}) | {areaStr} | {priceStr} ({installmentStr}) | {finishingArabic} | {p.Bedrooms}غ/{p.Bathrooms}ح | {elevator} | {constructionStatus} | الوحدات المتاحة: [{floorsSummary}]"
            );
        }

        // 3. Formulate System Prompt (Focused, high-impact Egyptian broker persona)
        var systemPrompt = $@"أنت 'مستشارك العقاري' - بائع وبروكر مصري محترف ومقنع بالسوق العقاري في المحلة الكبرى لدى منصة AqarCare (عقار كير).
تحدث بلهجة مصرية راقية وودودة ومقنعة (يا فندم، يا باشا، تحت أمرك).

قواعد السوق والعقارات بالمحلة الكبرى:
1. (الشعبية = منشية البكري): هما نفس الحي والمنطقة تماماً ويُطلق الاسمان بالتبادل بالمحلة! إذا طلب العميل أحدهما فكافة العقارات تلبي طلبه مباشرة ولا تفرّق بينهما.
2. (العمومي vs الجانبي): الشارع العمومي (المأمون، الصفوة، عمومي جمال عبد الناصر) أعلى سعراً وحركة تجارية وواجهة، أما الشارع الجانبي وثاني نمرة (جانبي جمال عبد الناصر محطة المنار، ثاني نمرة الفلل) فميزته الهدوء وتوفير ضخم بسعر المتر (~10 آلاف ج/م² مقابل 18-20 ألف على العمومي).
3. (مرونة المساحات والوحدات المتعددة):
   - في العرف العقاري المصري طلبات المساحة تكون تقريبية (مثلاً طلب 150م² ينطبق تماماً على شقة 147م² أو 145م² بفرق أمتار بسيطة، وطلب 100م² ينطبق على 95م² أو 105م²، وطلب 120م² ينطبق على 115م² و 117م²).
   - انتبه بحرص: بعض العقارات تشتمل على أكثر من شقة بمساحات مختلفة بالدور نفسه (مثل عقار #16 في عمومي جمال عبد الناصر يتوفر بالدور 4 شقة 1 مساحة 117م² وشقة 2 مساحة 147م²). إذا سأل العميل عن مساحة 147م² أو حوالي 150م² بشارع جمال عبد الناصر فرشح له عقار #16 واذكر له تفاصيل شقة 2 (147م² بسعر 2.28 مليون بالدور الرابع).
4. (حالة التشطيب):
   - تتوفر شقة سوبر لوكس جاهزة للسكن فوراً (عقار #23: 130م² بسعر 2 مليون بالشعبية).
   - تتوفر شقة نصف تشطيب (عقار #12: 135م² بسعر 1.755 مليون بشارع طلعت النجار).
   - باقي الشقق عظم على الطوب الأحمر وتتميز بتوفير سعر المتر وحرية التشطيب على ذوق العميل. ممنوع وصف أي شقة عظم بأنها جاهزة للسكن!
5. (البيوت والفلل): البيت يباع بالكامل كوحدة واحدة بالمبلغ الإجمالي المحدد وليس تسعيراً لكل دور.
6. (التفاوض): لا تذكر أي نسب مئوية أبداً من عندك. التفاوض المعتاد في السوق حوالي 50 ألف لكل مليون. أكد له أن التفاوض متاح مع المالك لتقريب المسافات، واسأله عن ميزانيته، وادعه لحجز موعد للمعاينة والتفاوض عبر الواتساب.
7. (المواعيد والمعاينات بالتنسيق مع الفريق): أنت ذكاء اصطناعي ولا تؤكد مواعيد ولا تحجز بنفسك! دائماً وجّه العميل للتواصل مع الفريق العقاري على الواتساب (01055937687 أو زر حجز معاينة) لترتيب وتأكيد الموعد فوراً.
8. (الصياغة والترشيح):
   - ردك مركز وجذاب وسريع (في حدود 60 إلى 120 كلمة).
   - عند ترشيح أي عقار، اعرض تفاصيله ومميزاته أولاً ثم ضع التاج الإلزامي للعقارات:
[PROPERTIES: id1, id2]
   - بعد التاج مباشرة اكتب سؤال المتابعة الختامي (مثلاً: 'إيه رأي حضرتك في الخيارات دي؟ يسعدنا تواصلك لحجز موعد معاينة بالتنسيق مع فريقنا 🤝').
   - اعتمد حصرياً على العقارات المذكورة أدناه ولا تخترع عقارات وهمية.

{inventoryBuilder}";

        // 4. Build Messages for Groq API (Lean conversation memory)
        var groqMessages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

        // Take last 6 messages to maintain conversational context while keeping token usage lean
        var recentMessages = (request.Messages ?? Array.Empty<ChatMessageDto>())
            .TakeLast(6)
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

        // 5. Multi-Model Cascade: Primary -> Fallback Models
        var candidateModels = new List<string> { primaryModel, "openai/gpt-oss-120b", "allam-2-7b", "openai/gpt-oss-20b" }
            .Where(m => !string.IsNullOrWhiteSpace(m))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        string replyText = string.Empty;
        Exception? lastEx = null;

        foreach (var tryModel in candidateModels)
        {
            try
            {
                replyText = await ExecuteGroqWithKeyRotationAsync(apiKeys, tryModel, groqMessages, maxTokens, temperature, ct);
                if (!string.IsNullOrWhiteSpace(replyText))
                {
                    break;
                }
            }
            catch (Exception ex)
            {
                lastEx = ex;
                _logger.LogWarning(ex, "Model candidate {Model} failed across all keys. Attempting next candidate in cascade...", tryModel);
            }
        }

        if (string.IsNullOrWhiteSpace(replyText))
        {
            _logger.LogError(lastEx, "All model candidates ({Models}) failed for AI Broker.", string.Join(", ", candidateModels));
            return new AIBrokerResponse(
                "أهلاً بحضرتك يا فندم! معلش حصل ضغط لحظي في الشبكة، بس أنا تحت أمرك دايماً. إيه الميزانية والمكان المناسب ليك في المحلة وأنا هساعدك في اختيار أنسب شقة فوراً؟",
                Array.Empty<int>(),
                Array.Empty<PropertyListItemDto>()
            );
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
            recommendedIds = recommendedIds.Where(id => properties.Any(p => p.Id == id)).ToList();
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
                    followUpMessage = "إيه رأي حضرتك في الخيارات المعروضة دي؟ وهل ده مناسب لطلبك؟ يسعدنا تواصلك لحجز موعد معاينة بالتنسيق مع فريقنا 🤝";
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
                var result = await CallGroqApiAsync(key, model, messages, maxTokens, temperature, ct);
                if (!string.IsNullOrWhiteSpace(result))
                {
                    return result;
                }
            }
            catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            {
                lastException = ex;
                _logger.LogWarning("Groq rate limit 429 encountered for model {Model} on key #{Index} ({KeyMask}).", model, currentIndex + 1, keyMask);
                if (i < keys.Count - 1)
                {
                    await Task.Delay(350, ct);
                }
            }
            catch (Exception ex)
            {
                lastException = ex;
                _logger.LogWarning(ex, "Groq call with key #{Index} ({KeyMask}) failed for model {Model}. Rotating...", currentIndex + 1, keyMask, model);
            }
        }

        throw lastException ?? new InvalidOperationException($"All Groq API keys failed for model {model}.");
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
            _logger.LogWarning("Groq API returned error status {StatusCode} for model {Model}: {ResponseBody}", response.StatusCode, model, responseBody);
            throw new HttpRequestException($"Groq API failed: {response.StatusCode} - {responseBody}", null, response.StatusCode);
        }

        using var doc = JsonDocument.Parse(responseBody);
        var root = doc.RootElement;
        if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var messageProp) &&
                messageProp.TryGetProperty("content", out var contentProp))
            {
                var content = contentProp.GetString()?.Trim();
                if (!string.IsNullOrEmpty(content))
                {
                    return content;
                }
            }
        }

        return string.Empty;
    }

    private static string FormatFloorDisplayCompact(PropertyFloor f)
    {
        var num = f.FloorNumber switch
        {
            71011 => "أدوار 7 و 10 و 11",
            _ when f.FloorNumber.HasValue => $"دور {f.FloorNumber.Value}",
            _ => !string.IsNullOrWhiteSpace(f.FloorName) ? f.FloorName : "دور غير محدد"
        };
        var price = f.Price.HasValue ? $"{f.Price.Value:N0}ج" : "";
        return string.IsNullOrEmpty(price) ? num : $"{num} ({price})";
    }

    private static string FormatFinishingCompact(string? status) => status switch
    {
        "Core-Shell" => "عظم على الطوب الأحمر (يحتاج تشطيب)",
        "Semi-Finished" => "نصف تشطيب (الأقرب للفينش والسكن)",
        "Finished" or "Lux" or "Super-Lux" or "High-Lux" => "تشطيب كامل",
        _ => status ?? "عظم"
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

    private static string GetCompactStreet(string? title, string? address, string? detailed)
    {
        var text = $"{title} {address} {detailed}".ToLowerInvariant();
        string streetType;
        if (text.Contains("ثاني نمرة") || text.Contains("تاني نمرة") || text.Contains("تاني نمره"))
            streetType = "ثاني نمرة هادئ وموفر بالمتر";
        else if (text.Contains("جانبي") || text.Contains("متفرع"))
            streetType = "شارع جانبي هادئ";
        else if (text.Contains("عمومي") || text.Contains("رئيسي"))
            streetType = "شارع رئيسي عمومي";
        else
            streetType = "شارع سكني";

        var specific = !string.IsNullOrWhiteSpace(address) ? address.Trim() : (title ?? "المحلة");
        if (!string.IsNullOrWhiteSpace(detailed) && !specific.Contains(detailed, StringComparison.OrdinalIgnoreCase))
        {
            specific += $" ({detailed.Trim()})";
        }

        return $"{specific} - {streetType}";
    }
}


