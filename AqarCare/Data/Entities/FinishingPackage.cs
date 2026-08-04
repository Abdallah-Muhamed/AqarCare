namespace AqarCare.Data.Entities;

public class FinishingPackage
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal PricePerSqm { get; set; }
    public string ShortDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal SupervisionPercent { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PackagePaymentPhase> PaymentPhases { get; set; } = new List<PackagePaymentPhase>();
    public ICollection<PackageSection> Sections { get; set; } = new List<PackageSection>();
    public ICollection<PackageNote> Notes { get; set; } = new List<PackageNote>();
    public ICollection<PackageMedia> Media { get; set; } = new List<PackageMedia>();
}
