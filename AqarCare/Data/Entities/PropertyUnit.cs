namespace AqarCare.Data.Entities;

public class PropertyUnit
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public decimal? SoldPrice { get; set; } // Actual sale price when sold
    public decimal? AreaSqm { get; set; }
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public string? PropertyType { get; set; } // Apartment, Villa, Commercial, etc.
    public string? ListingType { get; set; } // Sale, Rent
    public string? FinishingStatus { get; set; } // Semi-Finished, Finished, Super-Lux
    public int? FinishingPackageId { get; set; } // Foreign key to FinishingPackage
    public FinishingPackage? FinishingPackage { get; set; }
    public bool InstallmentAvailable { get; set; }
    public int? FloorNumber { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? Address { get; set; }
    public string Status { get; set; } = "Available"; // Available, Sold, Unavailable, Reserved, Rented
    public bool IsFeatured { get; set; }
    public bool IsPublished { get; set; }

    // Utility meters — whether each meter is available (not the meter number)
    public bool WaterMeterAvailable { get; set; }
    public bool ElectricityMeterAvailable { get; set; }
    public bool GasMeterAvailable { get; set; }
    public bool ElevatorAvailable { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PropertyMedia> Media { get; set; } = new List<PropertyMedia>();
}
