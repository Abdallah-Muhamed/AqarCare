namespace AqarCare.Data.Entities;

public class PropertyFloor
{
    public int Id { get; set; }
    public int PropertyUnitId { get; set; }
    public PropertyUnit PropertyUnit { get; set; } = null!;
    public int? FloorNumber { get; set; }
    public string? FloorName { get; set; }
    public decimal? Price { get; set; }
    public decimal? InstallmentPrice { get; set; }
    public decimal? AreaSqm { get; set; }
    public bool IsAvailable { get; set; } = true;
    public int SortOrder { get; set; }
}
