namespace AqarCare.Data.Entities;

public class PackagePaymentPhase
{
    public int Id { get; set; }
    public int FinishingPackageId { get; set; }
    public int Percentage { get; set; }
    public string PhaseDescription { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public FinishingPackage FinishingPackage { get; set; } = null!;
}
