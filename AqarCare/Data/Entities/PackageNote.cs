namespace AqarCare.Data.Entities;

public class PackageNote
{
    public int Id { get; set; }
    public int FinishingPackageId { get; set; }
    public string Text { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public FinishingPackage FinishingPackage { get; set; } = null!;
}
