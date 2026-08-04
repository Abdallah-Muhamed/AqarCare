namespace AqarCare.Data.Entities;

public class PropertyMedia
{
    public int Id { get; set; }
    public int PropertyUnitId { get; set; }
    public string MediaType { get; set; } = "Image";
    public string CloudinaryPublicId { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public PropertyUnit PropertyUnit { get; set; } = null!;
}
