namespace AqarCare.Data.Entities;

/// <summary>
/// Status tracking for customer property inquiries.
/// </summary>
public static class InquiryStatus
{
    public const string Pending = "Pending";
    public const string Contacted = "Contacted";
    public const string Closed = "Closed";

    public static readonly IReadOnlyList<string> All = [Pending, Contacted, Closed];

    public static bool IsValid(string status) => All.Contains(status, StringComparer.OrdinalIgnoreCase);
}

/// <summary>
/// Domain entity representing a customer inquiry or contact request for a property listing.
/// </summary>
public class PropertyInquiry
{
    public int Id { get; set; }
    public int PropertyUnitId { get; set; }
    public PropertyUnit? PropertyUnit { get; set; }
    public int? CustomerId { get; set; }
    public User? Customer { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = InquiryStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
