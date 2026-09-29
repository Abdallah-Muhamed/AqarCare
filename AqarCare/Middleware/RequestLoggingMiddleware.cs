using System.Diagnostics;

namespace AqarCare.Middleware;

/// <summary>
/// Middleware providing structured HTTP request and response execution logging,
/// tracking execution duration and status codes.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;

        // Skip static asset logging or swagger internal files if desired
        if (path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase) ||
            path.EndsWith(".js", StringComparison.OrdinalIgnoreCase) ||
            path.EndsWith(".css", StringComparison.OrdinalIgnoreCase) ||
            path.EndsWith(".ico", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var stopwatch = Stopwatch.StartNew();
        var traceId = context.TraceIdentifier;

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            var statusCode = context.Response.StatusCode;
            var elapsedMs = stopwatch.ElapsedMilliseconds;

            if (statusCode >= 500)
            {
                _logger.LogError("HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs}ms [TraceId: {TraceId}]",
                    context.Request.Method, path, statusCode, elapsedMs, traceId);
            }
            else if (statusCode >= 400)
            {
                _logger.LogWarning("HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs}ms [TraceId: {TraceId}]",
                    context.Request.Method, path, statusCode, elapsedMs, traceId);
            }
            else
            {
                _logger.LogInformation("HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs}ms [TraceId: {TraceId}]",
                    context.Request.Method, path, statusCode, elapsedMs, traceId);
            }
        }
    }
}
