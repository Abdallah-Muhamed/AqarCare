using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AqarCare.Controllers;
using AqarCare.DTOs;
using AqarCare.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AqarCare.Tests;

public class AuthServiceTests
{
    private readonly JwtSettings _jwtSettings;
    private readonly JwtTokenService _jwtService;
    private readonly IConfiguration _configuration;
    private readonly Mock<ILogger<AuthController>> _loggerMock;

    public AuthServiceTests()
    {
        _jwtSettings = new JwtSettings
        {
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            SecretKey = "SuperSecretKeyForTestingPurposesThatIsLongEnough123!",
            ExpirationMinutes = 60
        };
        _jwtService = new JwtTokenService(_jwtSettings);

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

        _loggerMock = new Mock<ILogger<AuthController>>();
    }

    [Fact]
    public void GenerateToken_ShouldCreateValidJwtWithAdminClaim()
    {
        // Act
        var token = _jwtService.GenerateToken("testadmin", "Admin");

        // Assert
        token.Should().NotBeNullOrWhiteSpace();

        var handler = new JwtSecurityTokenHandler();
        handler.CanReadToken(token).Should().BeTrue();

        var jwt = handler.ReadJwtToken(token);
        jwt.Issuer.Should().Be(_jwtSettings.Issuer);
        jwt.Audiences.Should().Contain(_jwtSettings.Audience);

        var roleClaim = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role");
        roleClaim.Should().NotBeNull();
        roleClaim!.Value.Should().Be("Admin");
    }

    [Fact]
    public void Login_WithValidCredentials_ShouldReturnOkWithToken()
    {
        // Arrange
        var controller = new AuthController(_jwtService, _configuration, _loggerMock.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        var request = new LoginRequest("testadmin", "SecureTestPass123!");

        // Act
        var result = controller.Login(request);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = (OkObjectResult)result.Result!;
        var response = okResult.Value as AuthResponseDto;

        response.Should().NotBeNull();
        response!.Username.Should().Be("testadmin");
        response.Role.Should().Be("Admin");
        response.Token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void Login_WithInvalidPassword_ShouldReturnUnauthorized()
    {
        // Arrange
        var controller = new AuthController(_jwtService, _configuration, _loggerMock.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        var request = new LoginRequest("testadmin", "WrongPassword!");

        // Act
        var result = controller.Login(request);

        // Assert
        result.Result.Should().BeOfType<UnauthorizedObjectResult>();
    }
}
