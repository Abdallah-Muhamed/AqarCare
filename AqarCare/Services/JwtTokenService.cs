using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace AqarCare.Services;

public class JwtSettings
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = "AqarCareApi";
    public string Audience { get; set; } = "AqarCareClient";
    public string SecretKey { get; set; } = "AqarCare_Super_Secret_Key_For_Jwt_Authentication_Must_Be_At_Least_32_Chars_Long!";
    public int ExpirationMinutes { get; set; } = 1440; // 24 hours
}

public interface IJwtTokenService
{
    string GenerateToken(string username, string role, IEnumerable<Claim>? extraClaims = null);
    string GenerateToken(int userId, string username, string role, string? email = null, IEnumerable<Claim>? extraClaims = null);
}

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtSettings _settings;

    public JwtTokenService(JwtSettings settings)
    {
        _settings = settings;
    }

    public string GenerateToken(string username, string role, IEnumerable<Claim>? extraClaims = null)
    {
        return GenerateToken(0, username, role, null, extraClaims);
    }

    public string GenerateToken(int userId, string username, string role, string? email = null, IEnumerable<Claim>? extraClaims = null)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_settings.SecretKey);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, userId > 0 ? userId.ToString() : username),
            new(ClaimTypes.Name, username),
            new(ClaimTypes.Role, role)
        };

        if (!string.IsNullOrWhiteSpace(email))
        {
            claims.Add(new Claim(JwtRegisteredClaimNames.Email, email));
            claims.Add(new Claim(ClaimTypes.Email, email));
        }

        if (extraClaims != null)
        {
            claims.AddRange(extraClaims);
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_settings.ExpirationMinutes),
            Issuer = _settings.Issuer,
            Audience = _settings.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
