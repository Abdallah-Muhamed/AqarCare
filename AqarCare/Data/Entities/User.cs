namespace AqarCare.Data.Entities;

/// <summary>
/// Defines application user roles for role-based authorization.
/// </summary>
public static class UserRoles
{
    public const string Admin = "Admin";
    public const string Customer = "Customer";
    public const string Agent = "Customer"; // legacy fallback

    public static readonly IReadOnlyList<string> All = [Admin, Customer];

    public static bool IsValidRole(string role) => All.Contains(role, StringComparer.OrdinalIgnoreCase);
}

/// <summary>
/// Application user entity supporting Admin, Agent, and Customer roles.
/// </summary>
public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = UserRoles.Customer;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
