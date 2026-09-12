namespace AqarCare.Data.Entities;

/// <summary>
/// A property's position in the application's custom coordinate space.
/// X and Y are normalized (0 to 1), allowing any future map artwork or viewport
/// size to be used without changing property data.
/// </summary>
public class PropertyMapLocation
{
    public int Id { get; set; }
    public int PropertyUnitId { get; set; }
    public int MapStreetId { get; set; }
    public decimal X { get; set; }
    public decimal Y { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public PropertyUnit PropertyUnit { get; set; } = null!;
    public MapStreet MapStreet { get; set; } = null!;
}
