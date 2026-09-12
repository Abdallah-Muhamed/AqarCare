namespace AqarCare.Data.Entities;

/// <summary>
/// A city for which AqarCare maintains its own map data. This is deliberately
/// independent from any third-party map provider or map-rendering library.
/// </summary>
public class MapCity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<MapStreet> Streets { get; set; } = new List<MapStreet>();
}
