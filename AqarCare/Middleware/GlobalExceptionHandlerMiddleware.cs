using System.Net;
using System.Text.Json;
using AqarCare.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AqarCare.Middleware;

/// <summary>
/// Global exception handling middleware that catches unhandled pipeline exceptions,
/// writes structured error logs with correlation Trace IDs, and returns consistent
/// RFC-aligned ApiErrorResponse payloads across all endpoints.
/// </summary>
public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;

        var (statusCode, message) = exception switch
        {
            DbUpdateConcurrencyException => (
                (int)HttpStatusCode.Conflict,
                "Conflict detected: The requested entity has been modified or deleted by another concurrent transaction. Please reload the latest data and retry."
            ),
            KeyNotFoundException knf => (
                (int)HttpStatusCode.NotFound,
                !string.IsNullOrWhiteSpace(knf.Message) ? knf.Message : "The requested resource was not found."
            ),
            UnauthorizedAccessException uae => (
                (int)HttpStatusCode.Forbidden,
                !string.IsNullOrWhiteSpace(uae.Message) ? uae.Message : "You do not have permission to perform this operation."
            ),
            ArgumentException ae => (
                (int)HttpStatusCode.BadRequest,
                ae.Message
            ),
            InvalidOperationException ioe => (
                (int)HttpStatusCode.BadRequest,
                ioe.Message
            ),
            BadHttpRequestException bhre => (
                (int)HttpStatusCode.BadRequest,
                bhre.Message
            ),
            _ => (
                (int)HttpStatusCode.InternalServerError,
                "An unexpected server error occurred while processing your request. Please try again later or contact system administration."
            )
        };

        if (statusCode >= 500)
        {
            _logger.LogError(exception,
                "Server failure handling {Method} {Path} [TraceId: {TraceId}] - StatusCode: {StatusCode}",
                context.Request.Method, context.Request.Path, traceId, statusCode);
        }
        else
        {
            _logger.LogWarning(
                "Client error handling {Method} {Path} [TraceId: {TraceId}] - StatusCode: {StatusCode} - Reason: {Reason}",
                context.Request.Method, context.Request.Path, traceId, statusCode, exception.Message);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var details = _environment.IsDevelopment() ? exception.ToString() : null;

        var response = new ApiErrorResponse(
            StatusCode: statusCode,
            Message: message,
            Details: details,
            TraceId: traceId,
            Timestamp: DateTime.UtcNow);

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}
