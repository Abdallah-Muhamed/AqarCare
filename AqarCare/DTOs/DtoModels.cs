using System.ComponentModel.DataAnnotations;

namespace AqarCare.DTOs;

public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);

public record PropertyMediaDto(int Id, string MediaType, string Url, int SortOrder);

public record PropertyFloorDto(
    int Id,
    int? FloorNumber,
    string? FloorName,
    decimal? Price,
    decimal? PricePerMeter,
    decimal? InstallmentPrice,
    decimal? SoldPrice,
    decimal? AreaSqm,
    bool IsAvailable,
    int SortOrder);

public record PropertyFloorInput(
    int? Id,
    int? FloorNumber,
    string? FloorName,
    decimal? Price,
    decimal? PricePerMeter,
    decimal? InstallmentPrice,
    decimal? SoldPrice = null,
    decimal? AreaSqm = null,
    bool IsAvailable = true,
    int SortOrder = 0);

public record PropertyListItemDto(
    int Id,
    string? Title,
    decimal? Price,
    decimal? SoldPrice,
    decimal? AreaSqm,
    int? Bedrooms,
    int? Bathrooms,
    string? PropertyType,
    string? ListingType,
    string? FinishingStatus,
    bool InstallmentAvailable,
    int? FloorNumber,
    string? City,
    string? District,
    string? Address,
    string? DetailedAddress,
    string Status,
    bool IsFeatured,
    string? PrimaryImageUrl,
    bool WaterMeterAvailable,
    bool ElectricityMeterAvailable,
    bool GasMeterAvailable,
    bool ElevatorAvailable,
    // House-specific fields
    int? NumberOfFloors,
    string? FloorsFinishing,
    // Land-specific fields
    decimal? FrontageWidth,
    decimal? FrontageLength,
    string? StreetWidth,
    bool HasElectricity,
    bool HasWater,
    bool HasSewerage,
    bool HasGas,
    decimal? InstallmentPrice = null,
    bool IsUnderConstruction = false,
    IReadOnlyList<PropertyFloorDto>? Floors = null,
    bool IsPublished = true,
    int? ApartmentsPerFloor = null);

public record PropertyDetailDto(
    int Id,
    string? Title,
    string? Description,
    decimal? Price,
    decimal? SoldPrice,
    decimal? AreaSqm,
    int? Bedrooms,
    int? Bathrooms,
    string? PropertyType,
    string? ListingType,
    string? FinishingStatus,
    int? FinishingPackageId,
    string? FinishingPackageName,
    bool InstallmentAvailable,
    int? FloorNumber,
    string? City,
    string? District,
    string? Address,
    string? DetailedAddress,
    string Status,
    bool IsFeatured,
    bool IsPublished,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    bool WaterMeterAvailable,
    bool ElectricityMeterAvailable,
    bool GasMeterAvailable,
    bool ElevatorAvailable,
    // House-specific fields
    int? NumberOfFloors,
    string? FloorsFinishing,
    // Land-specific fields
    decimal? FrontageWidth,
    decimal? FrontageLength,
    string? StreetWidth,
    bool HasElectricity,
    bool HasWater,
    bool HasSewerage,
    bool HasGas,
    IReadOnlyList<PropertyMediaDto> Media,
    decimal? InstallmentPrice = null,
    bool IsUnderConstruction = false,
    IReadOnlyList<PropertyFloorDto>? Floors = null,
    int? ApartmentsPerFloor = null);

public record CreatePropertyRequest(
    [MaxLength(200)] string? Title,
    [MaxLength(4000)] string? Description,
    decimal? Price,
    decimal? AreaSqm,
    int? Bedrooms,
    int? Bathrooms,
    [MaxLength(50)] string? PropertyType,
    [MaxLength(20)] string? ListingType,
    [MaxLength(50)] string? FinishingStatus,
    int? FinishingPackageId,
    bool InstallmentAvailable,
    int? FloorNumber,
    [MaxLength(100)] string? City,
    [MaxLength(100)] string? District,
    [MaxLength(300)] string? Address,
    [MaxLength(500)] string? DetailedAddress,
    string? Status,
    bool IsFeatured,
    bool IsPublished,
    // House-specific fields
    int? NumberOfFloors,
    [MaxLength(1000)] string? FloorsFinishing,
    // Land-specific fields
    decimal? FrontageWidth,
    decimal? FrontageLength,
    [MaxLength(50)] string? StreetWidth,
    bool HasElectricity,
    bool HasWater,
    bool HasSewerage,
    bool HasGas,
    // Utility meters - optional parameters at the end
    bool WaterMeterAvailable = false,
    bool ElectricityMeterAvailable = false,
    bool GasMeterAvailable = false,
    bool ElevatorAvailable = false,
    decimal? InstallmentPrice = null,
    bool IsUnderConstruction = false,
    IReadOnlyList<PropertyFloorInput>? Floors = null,
    int? ApartmentsPerFloor = null);

public record UpdatePropertyRequest(
    [MaxLength(200)] string? Title,
    [MaxLength(4000)] string? Description,
    decimal? Price,
    decimal? SoldPrice,
    decimal? AreaSqm,
    int? Bedrooms,
    int? Bathrooms,
    [MaxLength(50)] string? PropertyType,
    [MaxLength(20)] string? ListingType,
    [MaxLength(50)] string? FinishingStatus,
    int? FinishingPackageId,
    bool InstallmentAvailable,
    int? FloorNumber,
    [MaxLength(100)] string? City,
    [MaxLength(100)] string? District,
    [MaxLength(300)] string? Address,
    [MaxLength(500)] string? DetailedAddress,
    string? Status,
    bool IsFeatured,
    bool IsPublished,
    // House-specific fields
    int? NumberOfFloors,
    [MaxLength(1000)] string? FloorsFinishing,
    // Land-specific fields
    decimal? FrontageWidth,
    decimal? FrontageLength,
    [MaxLength(50)] string? StreetWidth,
    bool HasElectricity,
    bool HasWater,
    bool HasSewerage,
    bool HasGas,
    // Utility meters - optional parameters at the end
    bool WaterMeterAvailable = false,
    bool ElectricityMeterAvailable = false,
    bool GasMeterAvailable = false,
    bool ElevatorAvailable = false,
    decimal? InstallmentPrice = null,
    bool IsUnderConstruction = false,
    IReadOnlyList<PropertyFloorInput>? Floors = null,
    int? ApartmentsPerFloor = null);

public record AddPropertyMediaRequest(
    string MediaType,
    string CloudinaryPublicId,
    string Url,
    int SortOrder);

public record PropertyQuery(
    string? City = null,
    string? District = null,
    string? PropertyType = null,
    string? ListingType = null,
    string? FinishingStatus = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    decimal? MinArea = null,
    decimal? MaxArea = null,
    int? Bedrooms = null,
    int? Bathrooms = null,
    bool? ElevatorAvailable = null,
    bool? InstallmentAvailable = null,
    bool? IsUnderConstruction = null,
    string? Search = null,
    string? SortBy = null,
    bool? IsFeatured = null,
    int Page = 1,
    int PageSize = 12);

// Custom map contracts. Geometry is intentionally left renderer-neutral so a
// future client can choose SVG, canvas, WebGL, or another wholly custom map UI.
public record MapCityListItemDto(int Id, string Name, string Slug);

public record MapStreetDto(
    int Id,
    string Name,
    IReadOnlyList<string> Aliases,
    decimal? WidthMeters,
    decimal? LengthMeters,
    string? StreetType,
    string? TrafficDirection,
    string? SurfaceType,
    int Importance,
    string? GeometryJson,
    string? AttributesJson,
    int SortOrder);

public record MapPropertyDto(
    int Id,
    string? Title,
    decimal? Price,
    decimal? AreaSqm,
    string? PropertyType,
    string? ListingType,
    string Status,
    string? PrimaryImageUrl,
    decimal X,
    decimal Y,
    int StreetId,
    int? Bedrooms = null,
    int? Bathrooms = null,
    int? FloorNumber = null,
    string? FinishingStatus = null,
    string? Address = null,
    bool WaterMeterAvailable = false,
    bool ElectricityMeterAvailable = false,
    bool GasMeterAvailable = false,
    bool ElevatorAvailable = false,
    bool InstallmentAvailable = false,
    decimal? InstallmentPrice = null,
    bool IsUnderConstruction = false,
    int? ApartmentsPerFloor = null);

public record CityMapDto(
    int Id,
    string Name,
    string Slug,
    IReadOnlyList<MapStreetDto> Streets,
    IReadOnlyList<MapPropertyDto> Properties);

public record CreateMapCityRequest(
    [Required][MaxLength(100)] string Name,
    [Required][MaxLength(100)] string Slug,
    bool IsActive = true);

public record UpdateMapCityRequest(
    [Required][MaxLength(100)] string Name,
    [Required][MaxLength(100)] string Slug,
    bool IsActive);

public record CreateMapStreetRequest(
    [Required][MaxLength(200)] string Name,
    IReadOnlyList<string>? Aliases,
    [Range(0, 1000)] decimal? WidthMeters,
    [Range(0, 100000)] decimal? LengthMeters,
    [MaxLength(50)] string? StreetType,
    [MaxLength(50)] string? TrafficDirection,
    [MaxLength(50)] string? SurfaceType,
    [Range(0, 100)] int Importance,
    string? GeometryJson,
    string? AttributesJson,
    int SortOrder = 0,
    bool IsActive = true);

public record UpdateMapStreetRequest(
    [Required][MaxLength(200)] string Name,
    IReadOnlyList<string>? Aliases,
    [Range(0, 1000)] decimal? WidthMeters,
    [Range(0, 100000)] decimal? LengthMeters,
    [MaxLength(50)] string? StreetType,
    [MaxLength(50)] string? TrafficDirection,
    [MaxLength(50)] string? SurfaceType,
    [Range(0, 100)] int Importance,
    string? GeometryJson,
    string? AttributesJson,
    int SortOrder,
    bool IsActive);

public record SetPropertyMapLocationRequest(
    int MapStreetId,
    [Range(typeof(decimal), "0", "1")] decimal X,
    [Range(typeof(decimal), "0", "1")] decimal Y);

public record FinishingPackageListItemDto(
    int Id,
    string Name,
    string Slug,
    decimal PricePerSqm,
    string ShortDescription,
    int SortOrder,
    string? PrimaryImageUrl);

public record PackagePaymentPhaseDto(int Id, int Percentage, string PhaseDescription, int SortOrder);

public record PackageFeatureItemDto(int Id, string Text, int SortOrder);

public record PackageSectionDto(int Id, string Title, int SortOrder, IReadOnlyList<PackageFeatureItemDto> FeatureItems);

public record PackageNoteDto(int Id, string Text, int SortOrder);

public record FinishingPackageDetailDto(
    int Id,
    string Name,
    string Slug,
    decimal PricePerSqm,
    string ShortDescription,
    string Description,
    decimal SupervisionPercent,
    int SortOrder,
    bool IsActive,
    IReadOnlyList<PackagePaymentPhaseDto> PaymentPhases,
    IReadOnlyList<PackageSectionDto> Sections,
    IReadOnlyList<PackageNoteDto> Notes,
    IReadOnlyList<PropertyMediaDto> Media);

public record CreateFinishingPackageRequest(
    [Required][MaxLength(100)] string Name,
    [Required][MaxLength(100)] string Slug,
    [Range(0.01, double.MaxValue, ErrorMessage = "PricePerSqm must be greater than 0")] decimal PricePerSqm,
    [Required][MaxLength(500)] string ShortDescription,
    [Required][MaxLength(4000)] string Description,
    [Range(0, 100)] decimal SupervisionPercent,
    int SortOrder,
    bool IsActive,
    IReadOnlyList<PackagePaymentPhaseInput>? PaymentPhases = null,
    IReadOnlyList<PackageSectionInput>? Sections = null,
    IReadOnlyList<PackageNoteInput>? Notes = null);

public record UpdateFinishingPackageRequest(
    [Required][MaxLength(100)] string Name,
    [Required][MaxLength(100)] string Slug,
    [Range(0.01, double.MaxValue, ErrorMessage = "PricePerSqm must be greater than 0")] decimal PricePerSqm,
    [Required][MaxLength(500)] string ShortDescription,
    [Required][MaxLength(4000)] string Description,
    [Range(0, 100)] decimal SupervisionPercent,
    int SortOrder,
    bool IsActive,
    IReadOnlyList<PackagePaymentPhaseInput>? PaymentPhases = null,
    IReadOnlyList<PackageSectionInput>? Sections = null,
    IReadOnlyList<PackageNoteInput>? Notes = null);

public record PackagePaymentPhaseInput(int Percentage, string PhaseDescription, int SortOrder);

public record PackageSectionInput(string Title, int SortOrder, IReadOnlyList<PackageFeatureItemInput>? FeatureItems = null);

public record PackageFeatureItemInput(string Text, int SortOrder);

public record PackageNoteInput(string Text, int SortOrder);

public record AddPackageMediaRequest(
    string MediaType,
    string CloudinaryPublicId,
    string Url,
    int SortOrder);

public record MediaUploadResult(string PublicId, string Url, string MediaType);

// AI Broker Chat DTOs
public record ChatMessageDto(string Role, string Content);
public record AIBrokerRequest(IReadOnlyList<ChatMessageDto> Messages);
public record AIBrokerResponse(
    string Reply,
    IReadOnlyList<int> RecommendedPropertyIds,
    IReadOnlyList<PropertyListItemDto> RecommendedProperties);
