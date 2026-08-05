namespace AqarCare.Data.Entities;

public class PropertyUnit
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? SoldPrice { get; set; } // Actual sale price when sold
    public decimal AreaSqm { get; set; }
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public string PropertyType { get; set; } = string.Empty; // Apartment, Villa, Commercial, etc.
    public string ListingType { get; set; } = string.Empty; // Sale, Rent
    public string FinishingStatus { get; set; } = string.Empty; // Semi-Finished, Finished, Super-Lux
    public int? FinishingPackageId { get; set; } // Foreign key to FinishingPackage
    public FinishingPackage? FinishingPackage { get; set; }
    public bool InstallmentAvailable { get; set; }
    public int? FloorNumber { get; set; }
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Status { get; set; } = "Available"; // Available, Sold, Unavailable, Reserved, Rented
    public bool IsFeatured { get; set; }
    public bool IsPublished { get; set; }

    // Utility meter numbers
    public string? WaterMeterNumber { get; set; }
    public string? ElectricityMeterNumber { get; set; }
    public string? GasMeterNumber { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PropertyMedia> Media { get; set; } = new List<PropertyMedia>();
}
