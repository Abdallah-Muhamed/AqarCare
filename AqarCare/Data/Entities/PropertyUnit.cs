namespace AqarCare.Data.Entities;

public class PropertyUnit
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public decimal? InstallmentPrice { get; set; } // Price in case of installment
    public decimal? SoldPrice { get; set; } // Actual sale price when sold
    public decimal? AreaSqm { get; set; }
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public string? PropertyType { get; set; } // Apartment, House, Land, Commercial, etc.
    public string? ListingType { get; set; } // Sale, Rent
    public string? FinishingStatus { get; set; } // Semi-Finished, Finished, Super-Lux
    public int? FinishingPackageId { get; set; } // Foreign key to FinishingPackage
    public FinishingPackage? FinishingPackage { get; set; }
    public bool InstallmentAvailable { get; set; }
    public int? FloorNumber { get; set; }
    public int? ApartmentsPerFloor { get; set; } // Number of apartments per floor in the building (e.g. 2 or 3)
    
    // House-specific fields
    public int? NumberOfFloors { get; set; }
    public string? FloorsFinishing { get; set; } // JSON or text describing each floor's finishing
    public int? FinishedApartments { get; set; } // Number of finished apartments (متشطبة)
    public int? SemiFinishedApartments { get; set; } // Number of semi-finished apartments (نص تشطيب)
    public int? CoreShellApartments { get; set; } // Number of core & shell apartments (عظم)
    
    // Land-specific fields
    public decimal? FrontageWidth { get; set; } // in meters
    public decimal? FrontageLength { get; set; } // in meters
    public string? StreetWidth { get; set; } // width of street facing the land
    public bool HasElectricity { get; set; }
    public bool HasWater { get; set; }
    public bool HasSewerage { get; set; }
    public bool HasGas { get; set; }
    public string? City { get; set; } = "المحلة الكبرى";
    public string? District { get; set; }
    public string? Address { get; set; }
    public string? DetailedAddress { get; set; }
    public string Status { get; set; } = "Available"; // Available, Sold, Unavailable, Reserved, Rented
    public bool IsFeatured { get; set; }
    public bool IsUnderConstruction { get; set; } // Under Construction flag
    public bool IsPublished { get; set; }

    // Utility meters — whether each meter is available (not the meter number)
    public bool WaterMeterAvailable { get; set; }
    public bool ElectricityMeterAvailable { get; set; }
    public bool GasMeterAvailable { get; set; }
    public bool ElevatorAvailable { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PropertyMedia> Media { get; set; } = new List<PropertyMedia>();
    public ICollection<PropertyFloor> Floors { get; set; } = new List<PropertyFloor>();
    public PropertyMapLocation? MapLocation { get; set; }
}
