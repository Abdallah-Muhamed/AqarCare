using AqarCare.Filters;

namespace AqarCare.Middleware;

public class ApiKeyAuthMiddleware
{
    private const string ApiKeyHeaderName = "X-Api-Key";
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;

    public ApiKeyAuthMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var endpoint = context.GetEndpoint();
        var requiresApiKey = endpoint?.Metadata.GetMetadata<AdminApiKeyAttribute>() is not null
            || context.Request.Path.StartsWithSegments("/api/admin", StringComparison.OrdinalIgnoreCase);

        if (requiresApiKey)
        {
            var configuredKey = _configuration["Admin:ApiKey"];
            if (string.IsNullOrWhiteSpace(configuredKey))
            {
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                await context.Response.WriteAsJsonAsync(new { error = "Admin API key is not configured." });
                return;
            }

            if (!context.Request.Headers.TryGetValue(ApiKeyHeaderName, out var providedKey)
                || !string.Equals(providedKey.ToString(), configuredKey, StringComparison.Ordinal))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = "Invalid or missing API key." });
                return;
            }
        }

        await _next(context);
    }
}
