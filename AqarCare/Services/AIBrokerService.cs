using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
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

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        NumberHandling = JsonNumberHandling.AllowReadingFromString
    };

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
        var maxTokens = _configuration.GetValue<int?>("Groq:MaxTokens") ?? 450;
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

        // 1. System Prompt (Focused Egyptian Broker Persona — ZERO INVENTORY DUMP)
        var systemPrompt = @"أنت 'مستشارك العقاري' - بائع وبروكر مصري محترف ومقنع بالسوق العقاري في المحلة الكبرى لدى منصة AqarCare (عقار كير).
تحدث بلهجة مصرية راقية وودودة ومقنعة (يا فندم، يا باشا، تحت أمرك).

قواعد وأسلوب العمل:
1. (استخدام أداة البحث search_properties):
   - لديك أداة برمجية ذكية اسمها 'search_properties' للبحث الفوري في قاعدة بيانات العقارات.
   - كلما سأل العميل عن شقة، بيت، أرض، محل، مواصفات، أسعار، مساحات، أو مناطق معينة (مثل جمال عبد الناصر، الشعبية، طلعت النجار، إلخ)، يجب عليك فوراً استدعاء أداة 'search_properties' بالمعايير المناسبة.
   - إذا كانت رسالة العميل مجرد تحية عادية (مثل: السلام عليكم، صباح الخير، إزيك) أو استفسار عام لا يحدد عقاراً، رحب به بأسلوب ودود ولبق واسأله عن طلبه والميزانية والمكان المناسب له بالمحلة دون الحاجة لاستدعاء الأداة.
   - ممنوع تماماً اختراع أي عقار أو تفاصيل غير موجودة! اعتمد حصرياً على ما ترجعه لك أداة 'search_properties'.

2. (قواعد السوق بالمحلة الكبرى):
   - (الشعبية = منشية البكري): هما نفس الحي والمنطقة تماماً ويُطلق الاسمان بالتبادل بالمحلة! إذا طلب العميل أحدهما فابحث عن الشعبية / منشية البكري.
   - (العمومي vs الجانبي): الشارع العمومي (المأمون، الصفوة، عمومي جمال عبد الناصر) أعلى سعراً وحركة تجارية وواجهة، أما الشارع الجانبي وثاني نمرة (جانبي جمال عبد الناصر محطة المنار، ثاني نمرة الفلل) فميزته الهدوء وتوفير ضخم بسعر المتر (~10 آلاف ج/م² مقابل 18-20 ألف على العمومي).
   - (مرونة المساحات والوحدات المتعددة): طلبات المساحة تكون تقريبية (طلب 150م² ينطبق تماماً على شقة 147م² بفرق أمتار بسيطة، و 100م² ينطبق على 95م² أو 105م²). بعض العقارات تشتمل على أكثر من شقة بالدور بمساحات مختلفة، فاشرح له تفاصيل الشقة المطابقة لطلبه بدقة.
   - (حالة التشطيب): وضح حالة التشطيب بدقة (عظم على الطوب الأحمر، نصف تشطيب، سوبر لوكس). ممنوع وصف أي شقة عظم بأنها جاهزة للسكن فوراً!
   - (البيوت والفلل): البيت يباع بالكامل كوحدة واحدة بالمبلغ الإجمالي المحدد وليس تسعيراً لكل دور.
   - (التفاوض): لا تذكر أي نسب مئوية من عندك. التفاوض المعتاد في السوق حوالي 50 ألف لكل مليون. أكد للعميل أن التفاوض متاح مع المالك لتقريب المسافات، واسأله عن ميزانيته، وادعه لحجز موعد للمعاينة والتفاوض عبر الواتساب.
   - (المواعيد والمعاينات): أنت ذكاء اصطناعي ولا تؤكد مواعيد ولا تحجز بنفسك! دائماً وجّه العميل للتواصل مع الفريق العقاري على الواتساب (01055937687 أو زر حجز معاينة) لترتيب وتأكيد الموعد فوراً.

3. (صيغة الرد وترشيح العقارات):
   - ردك مركز وجذاب وسريع (في حدود 60 إلى 120 كلمة).
   - عند ترشيح أي عقار من نتائج البحث، اعرض تفاصيله ومميزاته الجذابة للعميل أولاً، ثم ضع التاج الإلزامي للعقارات المرشحة في سطر منفصل:
[PROPERTIES: id1, id2]
   - بعد التاج مباشرة، اختم بسؤال متابعة مشجع (مثلاً: 'إيه رأي حضرتك في الخيارات دي؟ يسعدنا تواصلك لحجز موعد معاينة بالتنسيق مع فريقنا 🤝').";

        // 2. Build Messages (System prompt + last 6 recent messages)
        var groqMessages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

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

        // Candidate models cascade
        var candidateModels = new List<string> { primaryModel, "llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b" }
            .Where(m => !string.IsNullOrWhiteSpace(m))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // 3. Step 1: Call Groq with Function Calling enabled
        var tools = GetBrokerTools();
        GroqChatResult firstStepResult;
        try
        {
            firstStepResult = await ExecuteGroqWithKeyRotationAsync(apiKeys, candidateModels, groqMessages, tools, maxTokens, temperature, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Groq Step 1 failed across all keys and models.");
            return new AIBrokerResponse(
                "أهلاً بحضرتك يا فندم! معلش حصل ضغط لحظي في الشبكة، بس أنا تحت أمرك دايماً. إيه الميزانية والمكان المناسب ليك في المحلة وأنا هساعدك في اختيار أنسب شقة فوراً؟",
                Array.Empty<int>(),
                Array.Empty<PropertyListItemDto>()
            );
        }

        string replyText = string.Empty;
        var searchResults = new List<PropertyUnit>();
        bool searchExecuted = false;

        // 4. Handle Tool Calls if emitted
        if (firstStepResult.HasToolCalls)
        {
            searchExecuted = true;

            // Append assistant tool-call message
            groqMessages.Add(new
            {
                role = "assistant",
                content = !string.IsNullOrWhiteSpace(firstStepResult.Content) ? firstStepResult.Content : "جارٍ البحث في قاعدة البيانات عن أنسب العقارات المتاحة...",
                tool_calls = firstStepResult.ToolCalls!.Select(tc => new
                {
                    id = tc.Id,
                    type = tc.Type,
                    function = new
                    {
                        name = tc.Function.Name,
                        arguments = tc.Function.Arguments
                    }
                }).ToList()
            });

            // Execute each tool call (typically search_properties)
            foreach (var tc in firstStepResult.ToolCalls!)
            {
                if (tc.Function.Name.Equals("search_properties", StringComparison.OrdinalIgnoreCase))
                {
                    PropertySearchParams searchParams;
                    try
                    {
                        searchParams = JsonSerializer.Deserialize<PropertySearchParams>(tc.Function.Arguments, JsonOpts) 
                                       ?? new PropertySearchParams();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to deserialize tool arguments: {Args}", tc.Function.Arguments);
                        searchParams = new PropertySearchParams();
                    }

                    _logger.LogInformation("AI Broker executing DB search: Query='{Query}', Area={MinA}-{MaxA}, Price={MinP}-{MaxP}, Type={Type}",
                        searchParams.Query, searchParams.MinArea, searchParams.MaxArea, searchParams.MinPrice, searchParams.MaxPrice, searchParams.PropertyType);

                    var (properties, isFallback) = await SearchPropertiesInDbAsync(searchParams, ct);
                    searchResults.AddRange(properties);

                    var toolContent = FormatSearchResultsForTool(properties, isFallback);

                    groqMessages.Add(new
                    {
                        role = "tool",
                        tool_call_id = tc.Id,
                        name = tc.Function.Name,
                        content = toolContent
                    });
                }
            }

            // Step 2: Request final response from Groq based on tool results (without tools to prevent recursive calls)
            try
            {
                var secondStepResult = await ExecuteGroqWithKeyRotationAsync(apiKeys, candidateModels, groqMessages, null, maxTokens, temperature, ct);
                replyText = secondStepResult.Content ?? string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Groq Step 2 completion failed.");
            }
        }
        else
        {
            // Direct reply (e.g. greeting or general assistance)
            replyText = firstStepResult.Content ?? string.Empty;
        }

        if (string.IsNullOrWhiteSpace(replyText))
        {
            return new AIBrokerResponse(
                "أهلاً بحضرتك يا فندم! أنا تحت أمرك، إيه مواصفات العقار والمكان اللي بتدور عليه بالمحلة وأنا هساعدك في اختيار أنسب شقة فوراً؟",
                Array.Empty<int>(),
                Array.Empty<PropertyListItemDto>()
            );
        }

        // 5. Parse [PROPERTIES: id1, id2] tag and separate followUpMessage
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

        // Fallback 1: detect mentioned property IDs in text (e.g. "عقار #16" or "#12")
        if (!recommendedIds.Any())
        {
            var mentionMatches = Regex.Matches(replyText, @"(?:عقار|العقار)?\s*#(\d+)", RegexOptions.IgnoreCase);
            foreach (Match m in mentionMatches)
            {
                if (int.TryParse(m.Groups[1].Value, out var id) && !recommendedIds.Contains(id))
                {
                    recommendedIds.Add(id);
                }
            }
        }

        // Fallback 2: If a search was executed and model discussed properties but omitted tags, use search results
        if (!recommendedIds.Any() && searchExecuted && searchResults.Any())
        {
            recommendedIds.AddRange(searchResults.Take(2).Select(p => p.Id));
        }

        // Split trailing follow-up question if not already separated
        if (recommendedIds.Any())
        {
            if (string.IsNullOrWhiteSpace(followUpMessage))
            {
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

        // 6. Fetch Property Cards (Only for recommended IDs)
        var recommendedProperties = new List<PropertyListItemDto>();
        if (recommendedIds.Any())
        {
            // First check if already in searchResults
            var existingMap = searchResults.ToDictionary(p => p.Id);
            var missingIds = recommendedIds.Where(id => !existingMap.ContainsKey(id)).ToList();

            var loadedProps = new List<PropertyUnit>();
            foreach (var id in recommendedIds)
            {
                if (existingMap.TryGetValue(id, out var found))
                {
                    loadedProps.Add(found);
                }
            }

            if (missingIds.Any())
            {
                var additionalProps = await _db.PropertyUnits
                    .AsNoTracking()
                    .Include(p => p.Floors)
                    .Include(p => p.Media)
                    .Where(p => missingIds.Contains(p.Id) && p.IsPublished)
                    .ToListAsync(ct);
                loadedProps.AddRange(additionalProps);
            }

            // Filter valid IDs and map to DTOs
            recommendedIds = loadedProps.Select(p => p.Id).Distinct().ToList();
            recommendedProperties = loadedProps.Select(PropertyService.ToListItem).ToList();
        }

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

    private async Task<GroqChatResult> ExecuteGroqWithKeyRotationAsync(
        List<string> keys,
        List<string> candidateModels,
        List<object> messages,
        object? tools,
        int maxTokens,
        double temperature,
        CancellationToken ct)
    {
        if (!keys.Any())
        {
            throw new InvalidOperationException("No valid Groq API keys available.");
        }

        Exception? lastEx = null;

        foreach (var tryModel in candidateModels)
        {
            var startIndex = (int)((uint)Interlocked.Increment(ref _keyCounter) % (uint)keys.Count);

            for (int i = 0; i < keys.Count; i++)
            {
                var currentIndex = (startIndex + i) % keys.Count;
                var key = keys[currentIndex];
                var keyMask = key.Length > 10 ? key[..6] + "..." + key[^4..] : "***";

                try
                {
                    var result = await CallGroqApiAsync(key, tryModel, messages, tools, maxTokens, temperature, ct);
                    if (!string.IsNullOrWhiteSpace(result.Content) || result.HasToolCalls)
                    {
                        return result;
                    }
                }
                catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    lastEx = ex;
                    _logger.LogWarning("Groq rate limit 429 encountered for model {Model} on key #{Index} ({KeyMask}).", tryModel, currentIndex + 1, keyMask);
                    if (i < keys.Count - 1)
                    {
                        await Task.Delay(350, ct);
                    }
                }
                catch (Exception ex)
                {
                    lastEx = ex;
                    _logger.LogWarning(ex, "Groq call with key #{Index} ({KeyMask}) failed for model {Model}. Rotating...", currentIndex + 1, keyMask, tryModel);
                }
            }
        }

        throw lastEx ?? new InvalidOperationException("All Groq API models and keys failed.");
    }

    private async Task<GroqChatResult> CallGroqApiAsync(
        string apiKey,
        string model,
        List<object> messages,
        object? tools,
        int maxTokens,
        double temperature,
        CancellationToken ct)
    {
        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var payload = new Dictionary<string, object?>
        {
            ["model"] = model,
            ["messages"] = messages,
            ["max_tokens"] = maxTokens,
            ["temperature"] = temperature
        };

        if (tools != null)
        {
            payload["tools"] = tools;
            payload["tool_choice"] = "auto";
        }

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
        var chatResult = new GroqChatResult();

        if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var messageProp))
            {
                if (messageProp.TryGetProperty("content", out var contentProp) && contentProp.ValueKind == JsonValueKind.String)
                {
                    chatResult.Content = contentProp.GetString()?.Trim();
                }

                if (messageProp.TryGetProperty("tool_calls", out var toolCallsProp) && toolCallsProp.ValueKind == JsonValueKind.Array)
                {
                    chatResult.ToolCalls = new List<GroqToolCallDto>();
                    foreach (var tc in toolCallsProp.EnumerateArray())
                    {
                        var toolCall = new GroqToolCallDto
                        {
                            Id = tc.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? "" : "",
                            Type = tc.TryGetProperty("type", out var typeProp) ? typeProp.GetString() ?? "function" : "function"
                        };

                        if (tc.TryGetProperty("function", out var fnProp))
                        {
                            toolCall.Function = new GroqFunctionDto
                            {
                                Name = fnProp.TryGetProperty("name", out var fnName) ? fnName.GetString() ?? "" : "",
                                Arguments = fnProp.TryGetProperty("arguments", out var fnArgs) ? fnArgs.GetString() ?? "{}" : "{}"
                            };
                        }

                        chatResult.ToolCalls.Add(toolCall);
                    }
                }
            }
        }

        return chatResult;
    }

    private async Task<(List<PropertyUnit> properties, bool isFallback)> SearchPropertiesInDbAsync(
        PropertySearchParams prms, 
        CancellationToken ct)
    {
        var query = _db.PropertyUnits
            .AsNoTracking()
            .Include(p => p.Floors)
            .Include(p => p.Media)
            .Where(p => p.IsPublished && (p.Status == "Available" || p.Status == "available"));

        // 1. Property Type filter
        if (!string.IsNullOrWhiteSpace(prms.PropertyType))
        {
            var type = prms.PropertyType.Trim();
            if (type.Equals("House", StringComparison.OrdinalIgnoreCase) || type.Equals("Villa", StringComparison.OrdinalIgnoreCase) || type.Contains("بيت") || type.Contains("منزل") || type.Contains("فيلا"))
            {
                query = query.Where(p => p.PropertyType == "House" || p.PropertyType == "Villa");
            }
            else if (type.Equals("Apartment", StringComparison.OrdinalIgnoreCase) || type.Contains("شقة") || type.Contains("شقه"))
            {
                query = query.Where(p => p.PropertyType == "Apartment");
            }
            else if (type.Equals("Land", StringComparison.OrdinalIgnoreCase) || type.Contains("أرض") || type.Contains("ارض"))
            {
                query = query.Where(p => p.PropertyType == "Land");
            }
            else if (type.Equals("Shop", StringComparison.OrdinalIgnoreCase) || type.Equals("Commercial", StringComparison.OrdinalIgnoreCase) || type.Contains("محل") || type.Contains("تجاري"))
            {
                query = query.Where(p => p.PropertyType == "Shop" || p.PropertyType == "Commercial");
            }
        }

        // 2. Elevator filter
        if (prms.HasElevator == true)
        {
            query = query.Where(p => p.ElevatorAvailable);
        }

        // 3. Installment filter
        if (prms.InstallmentOnly == true)
        {
            query = query.Where(p => p.InstallmentAvailable);
        }

        // 4. Bedrooms filter (flexible +- 1 bedroom)
        if (prms.Bedrooms.HasValue && prms.Bedrooms.Value > 0)
        {
            var b = prms.Bedrooms.Value;
            query = query.Where(p => p.Bedrooms >= b - 1 && p.Bedrooms <= b + 1);
        }

        // 5. Finishing status filter
        if (!string.IsNullOrWhiteSpace(prms.FinishingStatus))
        {
            var finish = prms.FinishingStatus.Trim();
            if (finish.Contains("Core", StringComparison.OrdinalIgnoreCase) || finish.Contains("عظم") || finish.Contains("طوب"))
            {
                query = query.Where(p => p.FinishingStatus == "Core-Shell" || string.IsNullOrEmpty(p.FinishingStatus));
            }
            else if (finish.Contains("Semi", StringComparison.OrdinalIgnoreCase) || finish.Contains("نصف"))
            {
                query = query.Where(p => p.FinishingStatus == "Semi-Finished" || p.Floors.Any(fl => fl.FinishingStatus == "Semi-Finished"));
            }
            else if (finish.Contains("Ultra", StringComparison.OrdinalIgnoreCase) || finish.Contains("الترا") || finish.Contains("ألترا"))
            {
                query = query.Where(p => p.FinishingStatus == "Ultra-Super-Lux" || p.FinishingStatus == "Mixed" || p.Floors.Any(fl => fl.FinishingStatus == "Ultra-Super-Lux"));
            }
            else if (finish.Contains("Super", StringComparison.OrdinalIgnoreCase) || finish.Contains("Lux", StringComparison.OrdinalIgnoreCase) || finish.Contains("تشطيب") || finish.Contains("لوكس"))
            {
                query = query.Where(p => p.FinishingStatus == "Finished" || p.FinishingStatus == "Lux" || p.FinishingStatus == "Super-Lux" || p.FinishingStatus == "High-Lux" || p.FinishingStatus == "Ultra-Super-Lux" || p.FinishingStatus == "Mixed" || p.Floors.Any(fl => fl.FinishingStatus != "Core-Shell"));
            }
        }

        // 6. Area filtering (checks both Property AreaSqm and individual unit Floor AreaSqm with 10% tolerance)
        if (prms.MinArea.HasValue && prms.MinArea.Value > 0)
        {
            var minATolerant = prms.MinArea.Value * 0.9m;
            query = query.Where(p => (p.AreaSqm.HasValue && p.AreaSqm.Value >= minATolerant) ||
                                     p.Floors.Any(f => f.IsAvailable && f.AreaSqm.HasValue && f.AreaSqm.Value >= minATolerant));
        }

        if (prms.MaxArea.HasValue && prms.MaxArea.Value > 0)
        {
            var maxATolerant = prms.MaxArea.Value * 1.1m;
            query = query.Where(p => (p.AreaSqm.HasValue && p.AreaSqm.Value <= maxATolerant) ||
                                     p.Floors.Any(f => f.IsAvailable && f.AreaSqm.HasValue && f.AreaSqm.Value <= maxATolerant));
        }

        // 7. Price filtering (checks both Property Price and Floor Prices with 10% tolerance)
        if (prms.MinPrice.HasValue && prms.MinPrice.Value > 0)
        {
            var minPTolerant = prms.MinPrice.Value * 0.9m;
            query = query.Where(p => (p.Price.HasValue && p.Price.Value >= minPTolerant) ||
                                     p.Floors.Any(f => f.IsAvailable && f.Price.HasValue && f.Price.Value >= minPTolerant) ||
                                     (p.InstallmentPrice.HasValue && p.InstallmentPrice.Value >= minPTolerant));
        }

        if (prms.MaxPrice.HasValue && prms.MaxPrice.Value > 0)
        {
            var maxPTolerant = prms.MaxPrice.Value * 1.1m;
            query = query.Where(p => (p.Price.HasValue && p.Price.Value <= maxPTolerant) ||
                                     p.Floors.Any(f => f.IsAvailable && f.Price.HasValue && f.Price.Value <= maxPTolerant) ||
                                     (p.InstallmentPrice.HasValue && p.InstallmentPrice.Value <= maxPTolerant));
        }

        // 8. Location / Street keywords filter
        if (!string.IsNullOrWhiteSpace(prms.Query))
        {
            var q = prms.Query.Trim();
            var isShaabiya = q.Contains("الشعبية") || q.Contains("شعبية") || q.Contains("البكري") || q.Contains("منشية البكري");

            var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "في", "ش", "شارع", "حي", "منطقة", "عايز", "عاوز", "شقة", "شقق", "بالمحلة", "المحلة", "بالمحله", "المحله", "عقار", "عقارات", "للبيع", "كاش", "تقسيط"
            };

            var keywords = q.Split(new[] { ' ', '،', ',', '-', '/', '\\' }, StringSplitOptions.RemoveEmptyEntries)
                .Where(w => w.Length > 1 && !stopWords.Contains(w))
                .ToList();

            if (isShaabiya)
            {
                query = query.Where(p =>
                    (p.District != null && (p.District.Contains("منشية البكري") || p.District.Contains("الشعبية"))) ||
                    (p.Title != null && (p.Title.Contains("منشية البكري") || p.Title.Contains("الشعبية"))) ||
                    (p.Address != null && (p.Address.Contains("منشية البكري") || p.Address.Contains("الشعبية"))) ||
                    (p.DetailedAddress != null && (p.DetailedAddress.Contains("منشية البكري") || p.DetailedAddress.Contains("الشعبية")))
                );
            }

            var streetKeywords = keywords.Where(w => !w.Contains("الشعبية") && !w.Contains("شعبية") && !w.Contains("البكري") && !w.Contains("منشية")).ToList();
            foreach (var kw in streetKeywords)
            {
                var localKw = kw;
                if (localKw.Contains("عبدالناصر") || localKw.Contains("عبد الناصر"))
                {
                    query = query.Where(p =>
                        (p.Title != null && (p.Title.Contains("عبد الناصر") || p.Title.Contains("عبدالناصر"))) ||
                        (p.Address != null && (p.Address.Contains("عبد الناصر") || p.Address.Contains("عبدالناصر"))) ||
                        (p.DetailedAddress != null && (p.DetailedAddress.Contains("عبد الناصر") || p.DetailedAddress.Contains("عبدالناصر"))) ||
                        (p.Description != null && (p.Description.Contains("عبد الناصر") || p.Description.Contains("عبدالناصر")))
                    );
                }
                else
                {
                    query = query.Where(p =>
                        (p.Title != null && p.Title.Contains(localKw)) ||
                        (p.Address != null && p.Address.Contains(localKw)) ||
                        (p.DetailedAddress != null && p.DetailedAddress.Contains(localKw)) ||
                        (p.District != null && p.District.Contains(localKw)) ||
                        (p.Description != null && p.Description.Contains(localKw))
                    );
                }
            }
        }

        var results = await query
            .OrderByDescending(p => p.IsFeatured)
            .ThenByDescending(p => p.CreatedAt)
            .Take(5)
            .ToListAsync(ct);

        if (results.Any())
        {
            return (results, false);
        }

        // Fallback: Relax price and area constraints to suggest closest available alternatives in the same area
        _logger.LogInformation("Strict search returned 0 items. Running relaxed fallback search...");
        var fallbackQuery = _db.PropertyUnits
            .AsNoTracking()
            .Include(p => p.Floors)
            .Include(p => p.Media)
            .Where(p => p.IsPublished && (p.Status == "Available" || p.Status == "available"));

        if (!string.IsNullOrWhiteSpace(prms.PropertyType))
        {
            var type = prms.PropertyType.Trim();
            if (type.Equals("Apartment", StringComparison.OrdinalIgnoreCase) || type.Contains("شقة"))
            {
                fallbackQuery = fallbackQuery.Where(p => p.PropertyType == "Apartment");
            }
            else if (type.Equals("House", StringComparison.OrdinalIgnoreCase) || type.Contains("بيت"))
            {
                fallbackQuery = fallbackQuery.Where(p => p.PropertyType == "House" || p.PropertyType == "Villa");
            }
        }

        if (!string.IsNullOrWhiteSpace(prms.Query))
        {
            var q = prms.Query.Trim();
            var isShaabiya = q.Contains("الشعبية") || q.Contains("شعبية") || q.Contains("البكري") || q.Contains("منشية البكري");
            if (isShaabiya)
            {
                fallbackQuery = fallbackQuery.Where(p =>
                    (p.District != null && (p.District.Contains("منشية البكري") || p.District.Contains("الشعبية"))) ||
                    (p.Title != null && (p.Title.Contains("منشية البكري") || p.Title.Contains("الشعبية"))) ||
                    (p.Address != null && (p.Address.Contains("منشية البكري") || p.Address.Contains("الشعبية")))
                );
            }
        }

        results = await fallbackQuery
            .OrderByDescending(p => p.IsFeatured)
            .ThenByDescending(p => p.CreatedAt)
            .Take(3)
            .ToListAsync(ct);

        return (results, true);
    }

    private static string FormatSearchResultsForTool(List<PropertyUnit> properties, bool isFallback)
    {
        if (!properties.Any())
        {
            return "لم يتم العثور على عقارات مطابقة في قاعدة البيانات حالياً. وضح ذلك للعميل واقترح عليه التواصل مع الفريق عبر الواتساب (01055937687) لتوفير طلبه مخصوص.";
        }

        var sb = new StringBuilder();
        if (isFallback)
        {
            sb.AppendLine($"ملاحظة: لم تتوفر شقق مطابقة لكافة الشروط بدقة (خاصة السعر/المساحة)، ولكن إليك أقرب {properties.Count} خيارات وبدائل متاحة في المنطقة لتقترحها على العميل كبديل وتوضح له الفرق:");
        }
        else
        {
            sb.AppendLine($"نتائج البحث المباشر من قاعدة بيانات AqarCare ({properties.Count} عقار مطابق):");
        }

        foreach (var p in properties)
        {
            var isHouse = p.PropertyType == "House" || p.PropertyType == "Villa";
            var availFloors = p.Floors?.Where(f => f.IsAvailable).ToList() ?? new List<PropertyFloor>();

            var distinctAreas = availFloors
                .Where(f => f.AreaSqm.HasValue && f.AreaSqm.Value > 0)
                .Select(f => f.AreaSqm!.Value)
                .Distinct()
                .OrderBy(a => a)
                .ToList();

            string areaStr = distinctAreas.Count > 1
                ? $"مساحات: {string.Join("م² و ", distinctAreas.Select(a => $"{a:N0}"))}م²"
                : distinctAreas.Count == 1 ? $"{distinctAreas[0]:N0}م²" : $"{p.AreaSqm:N0}م²";

            var availPrices = availFloors
                .Where(f => f.Price.HasValue && f.Price.Value > 0)
                .Select(f => f.Price!.Value)
                .ToList();

            string priceStr;
            if (availPrices.Any())
            {
                var minPrice = availPrices.Min();
                var maxPrice = availPrices.Max();
                priceStr = minPrice == maxPrice ? $"{minPrice:N0}ج" : $"من {minPrice:N0}ج إلى {maxPrice:N0}ج";
            }
            else if (p.Price.HasValue)
            {
                priceStr = $"{p.Price.Value:N0}ج";
            }
            else
            {
                priceStr = "غير محدد";
            }

            string floorsSummary;
            if (isHouse)
            {
                var aptPerFloor = p.ApartmentsPerFloor.HasValue
                    ? (p.ApartmentsPerFloor.Value == 1 ? "شقة بالدور" : p.ApartmentsPerFloor.Value == 2 ? "شقتين بالدور" : $"{p.ApartmentsPerFloor.Value} شقق بالدور")
                    : "شقة بالدور";
                var finishStats = new List<string>();
                if (p.FinishedApartments.GetValueOrDefault() > 0) finishStats.Add($"{p.FinishedApartments} شقة متشطبة");
                if (p.SemiFinishedApartments.GetValueOrDefault() > 0) finishStats.Add($"{p.SemiFinishedApartments} شقة نص تشطيب");
                if (p.CoreShellApartments.GetValueOrDefault() > 0) finishStats.Add($"{p.CoreShellApartments} شقة عظم");

                var finishDetail = finishStats.Any() ? string.Join("، ", finishStats) : "";
                floorsSummary = $"البيت يباع بالكامل كوحدة واحدة ({p.NumberOfFloors ?? p.Floors?.Count ?? 1} أدوار، {aptPerFloor}{(string.IsNullOrEmpty(finishDetail) ? "" : $"، وفيه: {finishDetail}")})";
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

            var finishingArabic = isHouse ? "" : FormatFinishingCompact(p.FinishingStatus);
            if (!isHouse && !string.IsNullOrWhiteSpace(p.FloorsFinishing))
            {
                finishingArabic = $"{finishingArabic} ({p.FloorsFinishing})";
            }
            var typeArabic = FormatPropertyTypeArabic(p.PropertyType);
            var listingArabic = FormatListingTypeArabic(p.ListingType);
            var districtArabic = (p.District == "منشية البكري" || (p.Title != null && p.Title.Contains("الشعبية")) || (p.Address != null && p.Address.Contains("الشعبية")))
                ? "منشية البكري (الشعبية)"
                : (p.District ?? "المحلة الكبرى");
            var streetLoc = GetCompactStreet(p.Title, p.Address, p.DetailedAddress);
            var constructionStatus = p.IsUnderConstruction ? "تحت الإنشاء" : "مبنى جاهز";
            var elevator = p.ElevatorAvailable ? "يوجد أسانسير" : "بدون أسانسير";
            var finishingPart = isHouse ? "" : $"{finishingArabic} | ";

            sb.AppendLine($"- [عقار #{p.Id}]: {typeArabic} {listingArabic} | {districtArabic} ({streetLoc}) | {areaStr} | {priceStr} ({installmentStr}) | {finishingPart}{p.Bedrooms}غ/{p.Bathrooms}ح | {elevator} | {constructionStatus} | المواصفات: [{floorsSummary}]");
        }

        return sb.ToString().TrimEnd();
    }

    private static List<object> GetBrokerTools()
    {
        return new List<object>
        {
            new
            {
                type = "function",
                function = new
                {
                    name = "search_properties",
                    description = "ابحث في قاعدة بيانات عقارات AqarCare بالمحلة الكبرى بالمواصفات المحددة للعميل (الشارع، المنطقة، المساحة، السعر، عدد الغرف، نوع العقار، التشطيب).",
                    parameters = new
                    {
                        type = "object",
                        properties = new
                        {
                            query = new
                            {
                                type = "string",
                                description = "اسم الشارع أو المنطقة أو الحي مثل 'جمال عبد الناصر', 'الشعبية', 'منشية البكري', 'المأمون', 'طلعت النجار'"
                            },
                            propertyType = new
                            {
                                type = "string",
                                @enum = new[] { "Apartment", "House", "Land", "Shop" },
                                description = "نوع العقار (Apartment للشقق, House للبيوت والمنازل, Land للأراضي, Shop للمحلات)"
                            },
                            minArea = new
                            {
                                type = "number",
                                description = "الحد الأدنى للمساحة بالمتر المربع"
                            },
                            maxArea = new
                            {
                                type = "number",
                                description = "الحد الأقصى للمساحة بالمتر المربع"
                            },
                            minPrice = new
                            {
                                type = "number",
                                description = "الحد الأدنى للسعر أو الميزانية بالجنيه المصري"
                            },
                            maxPrice = new
                            {
                                type = "number",
                                description = "الحد الأقصى للسعر أو الميزانية بالجنيه المصري"
                            },
                            bedrooms = new
                            {
                                type = "integer",
                                description = "عدد غرف النوم المطلوبة"
                            },
                            finishingStatus = new
                            {
                                type = "string",
                                @enum = new[] { "Core-Shell", "Semi-Finished", "Super-Lux" },
                                description = "حالة التشطيب المطلوبة (عظم: Core-Shell, نصف تشطيب: Semi-Finished, سوبر لوكس: Super-Lux)"
                            },
                            hasElevator = new
                            {
                                type = "boolean",
                                description = "هل يشترط وجود أسانسير"
                            },
                            installmentOnly = new
                            {
                                type = "boolean",
                                description = "هل يبحث عن تقسيط فقط"
                            }
                        }
                    }
                }
            }
        };
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
        "Ultra-Super-Lux" => "ألترا سوبر لوكس (فاخر)",
        "Mixed" => "تشطيب متعدد للأدوار",
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

public class PropertySearchParams
{
    public string? Query { get; set; }
    public string? PropertyType { get; set; }
    public decimal? MinArea { get; set; }
    public decimal? MaxArea { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? Bedrooms { get; set; }
    public string? FinishingStatus { get; set; }
    public bool? HasElevator { get; set; }
    public bool? InstallmentOnly { get; set; }
}

public class GroqChatResult
{
    public string? Content { get; set; }
    public List<GroqToolCallDto>? ToolCalls { get; set; }
    public bool HasToolCalls => ToolCalls != null && ToolCalls.Count > 0;
}

public class GroqToolCallDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = "function";
    public GroqFunctionDto Function { get; set; } = new();
}

public class GroqFunctionDto
{
    public string Name { get; set; } = string.Empty;
    public string Arguments { get; set; } = string.Empty;
}
