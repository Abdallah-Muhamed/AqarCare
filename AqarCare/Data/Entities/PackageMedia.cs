namespace AqarCare.Data.Entities;

public class PackageMedia
{
    public int Id { get; set; }
    public int FinishingPackageId { get; set; }
    public string MediaType { get; set; } = "Image";
    public string CloudinaryPublicId { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public FinishingPackage FinishingPackage { get; set; } = null!;
}
