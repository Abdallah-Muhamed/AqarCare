using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using AqarCare.Filters;

namespace AqarCare.Middleware;

/// <summary>
/// Dual authentication middleware for administrative and agent endpoints.
/// Supports both modern JWT Bearer token authentication and secure X-Api-Key machine headers.
/// Uses constant-time cryptographic comparison to mitigate side-channel timing attacks.
/// </summary>
public class ApiKeyAuthMiddleware
{
    private const string ApiKeyHeaderName = "X-Api-Key";
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ApiKeyAuthMiddleware> _logger;

    public ApiKeyAuthMiddleware(
        RequestDelegate next,
        IConfiguration configuration,
        ILogger<ApiKeyAuthMiddleware> logger)
    {
        _next = next;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var endpoint = context.GetEndpoint();
        var isUnderAdminPath = context.Request.Path.StartsWithSegments("/api/admin", StringComparison.OrdinalIgnoreCase);
        var hasAdminAttribute = endpoint?.Metadata.GetMetadata<AdminApiKeyAttribute>() is not null;

        if (isUnderAdminPath || hasAdminAttribute)
        {
            // 1. If already authenticated via JWT Bearer
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var isAdmin = context.User.IsInRole(UserRoles.Admin);
                var isAgent = context.User.IsInRole(UserRoles.Agent);

                // Admin has full access to all /api/admin paths
                if (isAdmin)
                {
                    await _next(context);
                    return;
                }

                // Agent has access to properties and inquiries endpoints under /api/admin
                if (isAgent && context.Request.Path.StartsWithSegments("/api/admin/properties", StringComparison.OrdinalIgnoreCase))
                {
                    await _next(context);
                    return;
                }

                _logger.LogWarning("Forbidden access attempt to {Path} by User {User} with role {Role}",
                    context.Request.Path, context.User.Identity?.Name, context.User.FindFirstValue(ClaimTypes.Role));

                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new ApiErrorResponse(
                    StatusCode: StatusCodes.Status403Forbidden,
                    Message: "Forbidden: You do not possess the required administrative permissions.",
                    TraceId: context.TraceIdentifier));
                return;
            }

            // 2. Validate X-Api-Key header (Machine-to-Machine Admin Access)
            var configuredKey = _configuration["Admin:ApiKey"];
            if (string.IsNullOrWhiteSpace(configuredKey))
            {
                _logger.LogError("Admin API Key is not configured in application settings");
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                await context.Response.WriteAsJsonAsync(new ApiErrorResponse(
                    StatusCode: StatusCodes.Status503ServiceUnavailable,
                    Message: "Admin API authentication is not configured on the server.",
                    TraceId: context.TraceIdentifier));
                return;
            }

            if (context.Request.Headers.TryGetValue(ApiKeyHeaderName, out var providedKey))
            {
                var providedBytes = Encoding.UTF8.GetBytes(providedKey.ToString());
                var configuredBytes = Encoding.UTF8.GetBytes(configuredKey);

                // Constant-time comparison prevents side-channel timing attacks
                if (CryptographicOperations.FixedTimeEquals(providedBytes, configuredBytes))
                {
                    var claims = new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "0"),
                        new Claim(ClaimTypes.Name, "ApiKeyAdmin"),
                        new Claim(ClaimTypes.Role, UserRoles.Admin)
                    };
                    var identity = new ClaimsIdentity(claims, "ApiKey");
                    context.User = new ClaimsPrincipal(identity);

                    await _next(context);
                    return;
                }
            }

            // Neither valid JWT nor valid API Key provided
            _logger.LogWarning("Unauthorized access attempt to {Path} from IP {IP}",
                context.Request.Path, context.Connection.RemoteIpAddress);

            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new ApiErrorResponse(
                StatusCode: StatusCodes.Status401Unauthorized,
                Message: "Unauthorized: Provide a valid Bearer token or X-Api-Key header.",
                TraceId: context.TraceIdentifier));
            return;
        }

        await _next(context);
    }
}
