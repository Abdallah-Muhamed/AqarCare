using System.Security.Claims;
using AqarCare.DTOs;
using AqarCare.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AqarCare.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IJwtTokenService _jwtService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IJwtTokenService jwtService,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _jwtService = jwtService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("login")]
    [EnableRateLimiting("AuthLimiter")]
    public ActionResult<AuthResponseDto> Login([FromBody] LoginRequest request)
    {
        var configuredUser = _configuration["Admin:Username"] ?? "admin";
        var configuredPassword = _configuration["Admin:Password"] ?? "AqarCareAdmin2026!Secure";

        // Constant-time check could be used, or basic string comparison here
        var isUsernameValid = string.Equals(request.Username, configuredUser, StringComparison.Ordinal);
        var isPasswordValid = string.Equals(request.Password, configuredPassword, StringComparison.Ordinal);

        if (!isUsernameValid || !isPasswordValid)
        {
            _logger.LogWarning("Failed login attempt for username '{Username}' from IP {IP}",
                request.Username, HttpContext.Connection.RemoteIpAddress);
            return Unauthorized(new { error = "Invalid credentials." });
        }

        var role = "Admin";
        var token = _jwtService.GenerateToken(request.Username, role);
        var expiresAt = DateTime.UtcNow.AddMinutes(
            _configuration.GetValue<int>("Jwt:ExpirationMinutes", 1440));

        _logger.LogInformation("Administrator '{Username}' logged in successfully from IP {IP}",
            request.Username, HttpContext.Connection.RemoteIpAddress);

        return Ok(new AuthResponseDto(token, request.Username, role, expiresAt));
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult GetCurrentUser()
    {
        var username = User.Identity?.Name ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "Unknown";
        var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

        return Ok(new
        {
            Username = username,
            Roles = roles,
            IsAuthenticated = User.Identity?.IsAuthenticated ?? false
        });
    }
}
