using System.Net;
using System.Text.Json;
using AqarCare.DTOs;
using AqarCare.Middleware;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AqarCare.Tests;

public class ErrorHandlingTests
{
    private readonly Mock<ILogger<GlobalExceptionHandlerMiddleware>> _loggerMock;
    private readonly Mock<IHostEnvironment> _envMock;

    public ErrorHandlingTests()
    {
        _loggerMock = new Mock<ILogger<GlobalExceptionHandlerMiddleware>>();
        _envMock = new Mock<IHostEnvironment>();
        _envMock.Setup(e => e.EnvironmentName).Returns(Environments.Production);
    }

    [Fact]
    public async Task Middleware_WhenDbUpdateConcurrencyExceptionThrown_ShouldReturn409ConflictWithStandardFormat()
    {
        // Arrange
        RequestDelegate next = (ctx) => throw new DbUpdateConcurrencyException("Concurrency violation");
        var middleware = new GlobalExceptionHandlerMiddleware(next, _loggerMock.Object, _envMock.Object);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Conflict);
        context.Response.ContentType.Should().Contain("application/json");

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var response = await JsonSerializer.DeserializeAsync<ApiErrorResponse>(
            context.Response.Body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        response.Should().NotBeNull();
        response!.StatusCode.Should().Be(409);
        response.Message.Should().Contain("Conflict detected");
        response.TraceId.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task Middleware_WhenKeyNotFoundExceptionThrown_ShouldReturn404NotFound()
    {
        // Arrange
        RequestDelegate next = (ctx) => throw new KeyNotFoundException("Property 999 does not exist.");
        var middleware = new GlobalExceptionHandlerMiddleware(next, _loggerMock.Object, _envMock.Object);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var response = await JsonSerializer.DeserializeAsync<ApiErrorResponse>(
            context.Response.Body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        response!.StatusCode.Should().Be(404);
        response.Message.Should().Be("Property 999 does not exist.");
    }

    [Fact]
    public async Task Middleware_WhenGenericExceptionThrownInProduction_ShouldReturn500WithoutInternalStackTrace()
    {
        // Arrange
        RequestDelegate next = (ctx) => throw new Exception("Sensitive internal database connection string failed");
        var middleware = new GlobalExceptionHandlerMiddleware(next, _loggerMock.Object, _envMock.Object);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var response = await JsonSerializer.DeserializeAsync<ApiErrorResponse>(
            context.Response.Body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        response!.StatusCode.Should().Be(500);
        response.Details.Should().BeNull(); // Never expose details in production!
        response.Message.Should().Contain("unexpected server error");
    }
}
