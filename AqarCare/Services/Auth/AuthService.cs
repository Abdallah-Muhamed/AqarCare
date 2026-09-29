using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AqarCare.Services.Auth;

public interface IAuthService
{
    Task<(bool Success, string? Error, AuthResponseDto? Response)> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<(bool Success, string? Error, AuthResponseDto? Response)> LoginAsync(LoginRequest request, string? remoteIp = null, CancellationToken ct = default);
    Task<UserProfileDto?> GetUserProfileAsync(int userId, CancellationToken ct = default);
    Task<UserProfileDto?> GetUserProfileByUsernameAsync(string username, CancellationToken ct = default);
}

public class AuthService : IAuthService
{
    private readonly AqarCareDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        AqarCareDbContext db,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtService,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<(bool Success, string? Error, AuthResponseDto? Response)> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var normalizedUsername = request.Username.Trim().ToLowerInvariant();
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var existingUser = await _db.Users
            .AnyAsync(u => u.Username.ToLower() == normalizedUsername || u.Email.ToLower() == normalizedEmail, ct);

        if (existingUser)
        {
            _logger.LogWarning("Registration attempt rejected: Username '{Username}' or Email '{Email}' already exists",
                request.Username, request.Email);
            return (false, "Username or email is already registered.", null);
        }

        var role = UserRoles.IsValidRole(request.Role) ? request.Role : UserRoles.Customer;

        var user = new User
        {
            Username = request.Username.Trim(),
            Email = request.Email.Trim(),
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Role = role,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("New user registered successfully: {Username} [UserId: {UserId}, Role: {Role}]",
            user.Username, user.Id, user.Role);

        var token = _jwtService.GenerateToken(user.Id, user.Username, user.Role, user.Email);
        var expiresAt = DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:ExpirationMinutes", 1440));

        var response = new AuthResponseDto(token, user.Username, user.Role, expiresAt, user.Id, user.FullName);
        return (true, null, response);
    }

    public async Task<(bool Success, string? Error, AuthResponseDto? Response)> LoginAsync(LoginRequest request, string? remoteIp = null, CancellationToken ct = default)
    {
        var normalizedInput = request.Username.Trim().ToLowerInvariant();

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedInput || u.Email.ToLower() == normalizedInput, ct);

        if (user != null)
        {
            if (!user.IsActive)
            {
                _logger.LogWarning("Inactive user {Username} attempted login from IP {IP}", request.Username, remoteIp);
                return (false, "This user account has been deactivated. Please contact support.", null);
            }

            if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Invalid password attempt for user {Username} from IP {IP}", request.Username, remoteIp);
                return (false, "Invalid username or password.", null);
            }

            var token = _jwtService.GenerateToken(user.Id, user.Username, user.Role, user.Email);
            var expiresAt = DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:ExpirationMinutes", 1440));

            _logger.LogInformation("User {Username} [{Role}] logged in successfully from IP {IP}",
                user.Username, user.Role, remoteIp);

            var response = new AuthResponseDto(token, user.Username, user.Role, expiresAt, user.Id, user.FullName);
            return (true, null, response);
        }

        // Fallback check against configuration for bootstrap admin
        var configuredAdminUser = _configuration["Admin:Username"] ?? "admin";
        var configuredAdminPass = _configuration["Admin:Password"] ?? "Admin123!Secure";

        if (string.Equals(request.Username, configuredAdminUser, StringComparison.Ordinal) &&
            string.Equals(request.Password, configuredAdminPass, StringComparison.Ordinal))
        {
            var token = _jwtService.GenerateToken(0, configuredAdminUser, UserRoles.Admin, "admin@aqarcare.com");
            var expiresAt = DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("Jwt:ExpirationMinutes", 1440));

            _logger.LogInformation("Bootstrap admin logged in successfully from IP {IP}", remoteIp);
            return (true, null, new AuthResponseDto(token, configuredAdminUser, UserRoles.Admin, expiresAt, 0, "Administrator"));
        }

        _logger.LogWarning("Login failed for unknown user '{Username}' from IP {IP}", request.Username, remoteIp);
        return (false, "Invalid username or password.", null);
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(int userId, CancellationToken ct = default)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null) return null;

        return new UserProfileDto(user.Id, user.Username, user.Email, user.FullName, user.PhoneNumber, user.Role, user.IsActive, user.CreatedAt);
    }

    public async Task<UserProfileDto?> GetUserProfileByUsernameAsync(string username, CancellationToken ct = default)
    {
        var normalized = username.Trim().ToLowerInvariant();
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username.ToLower() == normalized, ct);

        if (user == null) return null;

        return new UserProfileDto(user.Id, user.Username, user.Email, user.FullName, user.PhoneNumber, user.Role, user.IsActive, user.CreatedAt);
    }
}
