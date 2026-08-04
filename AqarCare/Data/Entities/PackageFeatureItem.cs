namespace AqarCare.Data.Entities;

public class PackageFeatureItem
{
    public int Id { get; set; }
    public int PackageSectionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public PackageSection PackageSection { get; set; } = null!;
}
