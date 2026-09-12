using AqarCare.Data;
using AqarCare.DTOs;
using AqarCare.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AqarCare.DataImport;

public class ImportProperties
{
    public static async Task Run(IServiceProvider serviceProvider)
    {
        var db = serviceProvider.GetRequiredService<AqarCareDbContext>();
        var propertyService = serviceProvider.GetRequiredService<PropertyService>();

        var jsonFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "DataImport", "properties.json");
        
        if (!File.Exists(jsonFilePath))
        {
            Console.WriteLine($"JSON file not found: {jsonFilePath}");
            return;
        }

        var jsonContent = await File.ReadAllTextAsync(jsonFilePath);
        var properties = JsonSerializer.Deserialize<List<PropertyImportDto>>(jsonContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (properties == null || properties.Count == 0)
        {
            Console.WriteLine("No properties found in JSON file.");
            return;
        }

        Console.WriteLine($"Found {properties.Count} properties to import.");

        foreach (var prop in properties)
        {
            try
            {
                var request = new CreatePropertyRequest(
                    prop.Title,
                    prop.Description,
                    prop.Price,
                    prop.AreaSqm,
                    prop.Bedrooms,
                    prop.Bathrooms,
                    prop.PropertyType,
                    prop.ListingType,
                    prop.FinishingStatus,
                    prop.FinishingPackageId,
                    prop.InstallmentAvailable,
                    prop.FloorNumber,
                    prop.City,
                    prop.District,
                    prop.Address,
                    prop.DetailedAddress,
                    prop.Status,
                    prop.IsFeatured,
                    prop.IsPublished,
                    prop.NumberOfFloors,
                    prop.FloorsFinishing,
                    prop.FrontageWidth,
                    prop.FrontageLength,
                    prop.StreetWidth,
                    prop.HasElectricity,
                    prop.HasWater,
                    prop.HasSewerage,
                    prop.HasGas,
                    prop.WaterMeterAvailable,
                    prop.ElectricityMeterAvailable,
                    prop.GasMeterAvailable,
                    prop.ElevatorAvailable
                );

                var created = await propertyService.CreateAsync(request);
                Console.WriteLine($"✓ Created property: {prop.Title} (ID: {created.Id})");

                // Add media if any
                if (prop.Media != null && prop.Media.Count > 0)
                {
                    foreach (var media in prop.Media)
                    {
                        var mediaRequest = new AddPropertyMediaRequest(
                            media.MediaType,
                            "", // CloudinaryPublicId - empty for now
                            media.Url,
                            media.SortOrder
                        );
                        await propertyService.AddMediaAsync(created.Id, mediaRequest);
                        Console.WriteLine($"  → Added media: {media.MediaType}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Failed to create property: {prop.Title}. Error: {ex.Message}");
            }
        }

        Console.WriteLine("Import completed.");
    }
}

public class PropertyImportDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public decimal? AreaSqm { get; set; }
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public string? PropertyType { get; set; }
    public string? ListingType { get; set; }
    public string? FinishingStatus { get; set; }
    public int? FinishingPackageId { get; set; }
    public bool InstallmentAvailable { get; set; }
    public int? FloorNumber { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? Address { get; set; }
    public string? DetailedAddress { get; set; }
    public string? Status { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsPublished { get; set; }
    public bool WaterMeterAvailable { get; set; }
    public bool ElectricityMeterAvailable { get; set; }
    public bool GasMeterAvailable { get; set; }
    public bool ElevatorAvailable { get; set; }
    // House-specific fields
    public int? NumberOfFloors { get; set; }
    public string? FloorsFinishing { get; set; }
    // Land-specific fields
    public decimal? FrontageWidth { get; set; }
    public decimal? FrontageLength { get; set; }
    public string? StreetWidth { get; set; }
    public bool HasElectricity { get; set; }
    public bool HasWater { get; set; }
    public bool HasSewerage { get; set; }
    public bool HasGas { get; set; }
    public List<MediaImportDto>? Media { get; set; }
}

public class MediaImportDto
{
    public string MediaType { get; set; } = "Image";
    public string Url { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
