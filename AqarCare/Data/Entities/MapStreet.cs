namespace AqarCare.Data.Entities;

/// <summary>
/// A street or named area on a custom city map. GeometryJson is renderer-neutral
/// data owned by the application; the future custom client defines how to draw it.
/// </summary>
public class MapStreet
{
    public int Id { get; set; }
    public int MapCityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal? WidthMeters { get; set; }
    public decimal? LengthMeters { get; set; }
    public string? StreetType { get; set; }
    public string? TrafficDirection { get; set; }
    public string? SurfaceType { get; set; }
    public int Importance { get; set; }
    public string? GeometryJson { get; set; }
    /// <summary>Optional future attributes without imposing a final map design.</summary>
    public string? AttributesJson { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public MapCity MapCity { get; set; } = null!;
    public ICollection<MapStreetAlias> Aliases { get; set; } = new List<MapStreetAlias>();
    public ICollection<PropertyMapLocation> PropertyLocations { get; set; } = new List<PropertyMapLocation>();
}
