using System.Security.Claims;
using AqarCare.DTOs;
using AqarCare.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AqarCare.Controllers;

/// <summary>
/// Authentication and user identity management endpoints.
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Authenticates a user (Admin, Agent, or Customer) and returns a signed JWT Bearer token.
    /// </summary>
    /// <param name="request">User login credentials.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Authentication successful; returns token and user role.</response>
    /// <response code="401">Invalid credentials or deactivated account.</response>
    /// <response code="429">Too many login attempts from this IP address.</response>
    [HttpPost("login")]
    [EnableRateLimiting("AuthLimiter")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        var (success, error, response) = await _authService.LoginAsync(request, remoteIp, ct);

        if (!success || response == null)
        {
            return Unauthorized(new ApiErrorResponse(
                StatusCode: StatusCodes.Status401Unauthorized,
                Message: error ?? "Invalid username or password.",
                TraceId: HttpContext.TraceIdentifier));
        }

        return Ok(response);
    }

    /// <summary>
    /// Registers a new user account (defaults to Customer role; can also register as Agent).
    /// </summary>
    /// <param name="request">Registration details including username, email, and password.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Registration successful; returns token and user profile.</response>
    /// <response code="400">Validation failure or duplicate username/email.</response>
    [HttpPost("register")]
    [EnableRateLimiting("AuthLimiter")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var (success, error, response) = await _authService.RegisterAsync(request, ct);

        if (!success || response == null)
        {
            return BadRequest(new ApiErrorResponse(
                StatusCode: StatusCodes.Status400BadRequest,
                Message: error ?? "Registration could not be completed.",
                TraceId: HttpContext.TraceIdentifier));
        }

        return Ok(response);
    }

    /// <summary>
    /// Inspects the currently authenticated identity, roles, and profile attributes.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Returns current claims, username, and assigned roles.</response>
    /// <response code="401">Caller is not authenticated.</response>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> GetCurrentUser(CancellationToken ct)
    {
        var username = User.Identity?.Name ?? User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
        var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);

        UserProfileDto? profile = null;
        if (int.TryParse(userIdStr, out var userId) && userId > 0)
        {
            profile = await _authService.GetUserProfileAsync(userId, ct);
        }
        else
        {
            profile = await _authService.GetUserProfileByUsernameAsync(username, ct);
        }

        return Ok(new
        {
            Id = profile?.Id ?? (int.TryParse(userIdStr, out var id) ? id : 0),
            Username = username,
            FullName = profile?.FullName ?? username,
            Email = profile?.Email ?? User.FindFirstValue(ClaimTypes.Email),
            PhoneNumber = profile?.PhoneNumber,
            Roles = roles,
            PrimaryRole = roles.FirstOrDefault() ?? "Customer",
            IsAuthenticated = User.Identity?.IsAuthenticated ?? false
        });
    }
}
