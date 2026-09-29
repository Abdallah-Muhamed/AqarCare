using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AqarCare.Controllers;
using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using AqarCare.Services;
using AqarCare.Services.Auth;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AqarCare.Tests;

public class AuthServiceTests : IDisposable
{
    private readonly AqarCareDbContext _context;
    private readonly JwtSettings _jwtSettings;
    private readonly JwtTokenService _jwtService;
    private readonly PasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;
    private readonly AuthService _authService;
    private readonly Mock<ILogger<AuthController>> _controllerLoggerMock;
    private readonly Mock<ILogger<AuthService>> _serviceLoggerMock;

    public AuthServiceTests()
    {
        var dbOptions = new DbContextOptionsBuilder<AqarCareDbContext>()
            .UseInMemoryDatabase(databaseName: $"AuthTestDb_{Guid.NewGuid()}")
            .Options;

        _context = new AqarCareDbContext(dbOptions);

        _jwtSettings = new JwtSettings
        {
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            SecretKey = "SuperSecretKeyForTestingPurposesThatIsLongEnough123!",
            ExpirationMinutes = 60
        };
        _jwtService = new JwtTokenService(_jwtSettings);
        _passwordHasher = new PasswordHasher();

        var configValues = new Dictionary<string, string?>
        {
            { "Admin:Username", "testadmin" },
            { "Admin:Password", "SecureTestPass123!" },
            { "Admin:ApiKey", "valid-test-key" },
            { "Jwt:ExpirationMinutes", "60" }
        };
        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configValues)
            .Build();

        _serviceLoggerMock = new Mock<ILogger<AuthService>>();
        _controllerLoggerMock = new Mock<ILogger<AuthController>>();

        _authService = new AuthService(_context, _passwordHasher, _jwtService, _configuration, _serviceLoggerMock.Object);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public void PasswordHasher_ShouldHashAndVerifyPasswordCorrectly()
    {
        // Arrange
        const string password = "MySecretPassword2026!";

        // Act
        var hash = _passwordHasher.HashPassword(password);
        var isValid = _passwordHasher.VerifyPassword(password, hash);
        var isInvalid = _passwordHasher.VerifyPassword("WrongPassword", hash);

        // Assert
        hash.Should().NotBeNullOrWhiteSpace();
        isValid.Should().BeTrue();
        isInvalid.Should().BeFalse();
    }

    [Fact]
    public void GenerateToken_ShouldCreateValidJwtWithRoleAndUserIdClaims()
    {
        // Act
        var token = _jwtService.GenerateToken(42, "testagent", UserRoles.Agent, "agent@aqarcare.com");

        // Assert
        token.Should().NotBeNullOrWhiteSpace();

        var handler = new JwtSecurityTokenHandler();
        handler.CanReadToken(token).Should().BeTrue();

        var jwt = handler.ReadJwtToken(token);
        jwt.Issuer.Should().Be(_jwtSettings.Issuer);
        jwt.Audiences.Should().Contain(_jwtSettings.Audience);

        var roleClaim = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role");
        roleClaim.Should().NotBeNull();
        roleClaim!.Value.Should().Be(UserRoles.Agent);

        var nameIdClaim = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid");
        nameIdClaim.Should().NotBeNull();
        nameIdClaim!.Value.Should().Be("42");
    }

    [Fact]
    public async Task RegisterAsync_WithCustomerRole_ShouldPersistUserAndReturnToken()
    {
        // Arrange
        var request = new RegisterRequest(
            Username: "customer1",
            Email: "customer1@example.com",
            Password: "SecurePassword123!",
            FullName: "Customer One",
            PhoneNumber: "+201012345678",
            Role: UserRoles.Customer);

        // Act
        var (success, error, response) = await _authService.RegisterAsync(request);

        // Assert
        success.Should().BeTrue();
        error.Should().BeNull();
        response.Should().NotBeNull();
        response!.Role.Should().Be(UserRoles.Customer);
        response.Username.Should().Be("customer1");
        response.Token.Should().NotBeNullOrWhiteSpace();

        var persisted = await _context.Users.FirstOrDefaultAsync(u => u.Username == "customer1");
        persisted.Should().NotBeNull();
        persisted!.Role.Should().Be(UserRoles.Customer);
    }

    [Fact]
    public async Task RegisterAsync_WithDuplicateUsername_ShouldFail()
    {
        // Arrange
        var req1 = new RegisterRequest("samir", "samir1@test.com", "Pass123!", "Samir One", Role: UserRoles.Agent);
        var req2 = new RegisterRequest("samir", "samir2@test.com", "Pass123!", "Samir Two", Role: UserRoles.Agent);

        await _authService.RegisterAsync(req1);

        // Act
        var (success, error, _) = await _authService.RegisterAsync(req2);

        // Assert
        success.Should().BeFalse();
        error.Should().Contain("already registered");
    }

    [Fact]
    public async Task LoginAsync_WithValidDbUserCredentials_ShouldReturnSuccess()
    {
        // Arrange
        var reg = new RegisterRequest("agent_tarek", "tarek@test.com", "AgentPassword123!", "Tarek Agent", Role: UserRoles.Agent);
        await _authService.RegisterAsync(reg);

        var loginReq = new LoginRequest("agent_tarek", "AgentPassword123!");

        // Act
        var (success, error, response) = await _authService.LoginAsync(loginReq, "127.0.0.1");

        // Assert
        success.Should().BeTrue();
        error.Should().BeNull();
        response.Should().NotBeNull();
        response!.Role.Should().Be(UserRoles.Agent);
        response.Username.Should().Be("agent_tarek");
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ShouldReturnFailure()
    {
        // Arrange
        var reg = new RegisterRequest("customer_ali", "ali@test.com", "AliPassword123!", "Ali Customer", Role: UserRoles.Customer);
        await _authService.RegisterAsync(reg);

        var loginReq = new LoginRequest("customer_ali", "WrongPassword!");

        // Act
        var (success, error, response) = await _authService.LoginAsync(loginReq, "127.0.0.1");

        // Assert
        success.Should().BeFalse();
        error.Should().Contain("Invalid");
        response.Should().BeNull();
    }

    [Fact]
    public async Task Controller_Login_WithValidCredentials_ShouldReturnOkWithToken()
    {
        // Arrange
        var reg = new RegisterRequest("agent_john", "john@test.com", "ValidPass123!", "John Agent", Role: UserRoles.Agent);
        await _authService.RegisterAsync(reg);

        var controller = new AuthController(_authService, _controllerLoggerMock.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var request = new LoginRequest("agent_john", "ValidPass123!");

        // Act
        var result = await controller.Login(request, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = (OkObjectResult)result.Result!;
        var response = okResult.Value as AuthResponseDto;

        response.Should().NotBeNull();
        response!.Username.Should().Be("agent_john");
        response.Role.Should().Be(UserRoles.Agent);
        response.Token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task Controller_Login_WithInvalidPassword_ShouldReturnUnauthorized()
    {
        // Arrange
        var controller = new AuthController(_authService, _controllerLoggerMock.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var request = new LoginRequest("testadmin", "WrongPassword!");

        // Act
        var result = await controller.Login(request, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<UnauthorizedObjectResult>();
    }
}
