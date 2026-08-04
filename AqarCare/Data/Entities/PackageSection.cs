namespace AqarCare.Data.Entities;

public class PackageSection
{
    public int Id { get; set; }
    public int FinishingPackageId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public FinishingPackage FinishingPackage { get; set; } = null!;
    public ICollection<PackageFeatureItem> FeatureItems { get; set; } = new List<PackageFeatureItem>();
}
