namespace AqarCare.Data.Entities;

/// <summary>
/// A searchable alternate or locally used name for a street.
/// </summary>
public class MapStreetAlias
{
    public int Id { get; set; }
    public int MapStreetId { get; set; }
    public string Name { get; set; } = string.Empty;

    public MapStreet MapStreet { get; set; } = null!;
}
