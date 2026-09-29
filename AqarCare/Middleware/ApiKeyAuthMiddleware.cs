using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AqarCare.Filters;

namespace AqarCare.Middleware;

/// <summary>
/// Dual authentication middleware for administrative endpoints.
/// Supports both modern JWT Bearer token authentication and secure X-Api-Key headers.
/// Uses constant-time cryptographic comparison to mitigate side-channel timing attacks.
/// </summary>
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
        var requiresAdmin = endpoint?.Metadata.GetMetadata<AdminApiKeyAttribute>() is not null
            || context.Request.Path.StartsWithSegments("/api/admin", StringComparison.OrdinalIgnoreCase);

        if (requiresAdmin)
        {
            // 1. If already authenticated via JWT Bearer with Admin role
            if (context.User.Identity?.IsAuthenticated == true && context.User.IsInRole("Admin"))
            {
                await _next(context);
                return;
            }

            // 2. Validate X-Api-Key header
            var configuredKey = _configuration["Admin:ApiKey"];
            if (string.IsNullOrWhiteSpace(configuredKey))
            {
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                await context.Response.WriteAsJsonAsync(new { error = "Admin authentication is not configured on the server." });
                return;
            }

            if (context.Request.Headers.TryGetValue(ApiKeyHeaderName, out var providedKey))
            {
                var providedBytes = Encoding.UTF8.GetBytes(providedKey.ToString());
                var configuredBytes = Encoding.UTF8.GetBytes(configuredKey);

                // Constant-time comparison prevents timing attacks
                if (CryptographicOperations.FixedTimeEquals(providedBytes, configuredBytes))
                {
                    var claims = new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "ApiKeyAdmin"),
                        new Claim(ClaimTypes.Name, "ApiKeyAdmin"),
                        new Claim(ClaimTypes.Role, "Admin")
                    };
                    var identity = new ClaimsIdentity(claims, "ApiKey");
                    context.User = new ClaimsPrincipal(identity);

                    await _next(context);
                    return;
                }
            }

            // Neither valid JWT nor valid API Key provided
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "Unauthorized: Provide a valid Bearer token or X-Api-Key header." });
            return;
        }

        await _next(context);
    }
}
