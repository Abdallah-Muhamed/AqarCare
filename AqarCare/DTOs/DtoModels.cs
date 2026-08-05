using System.ComponentModel.DataAnnotations;

namespace AqarCare.DTOs;

public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);

public record PropertyMediaDto(int Id, string MediaType, string Url, int SortOrder);

public record PropertyListItemDto(
    int Id,
    string Title,
    decimal Price,
    decimal? SoldPrice,
    decimal AreaSqm,
    int Bedrooms,
    int Bathrooms,
    string PropertyType,
    string ListingType,
    string FinishingStatus,
    bool InstallmentAvailable,
    int? FloorNumber,
    string City,
    string District,
    string Status,
    bool IsFeatured,
    string? PrimaryImageUrl,
    string? WaterMeterNumber,
    string? ElectricityMeterNumber,
    string? GasMeterNumber);

public record PropertyDetailDto(
    int Id,
    string Title,
    string Description,
    decimal Price,
    decimal? SoldPrice,
    decimal AreaSqm,
    int Bedrooms,
    int Bathrooms,
    string PropertyType,
    string ListingType,
    string FinishingStatus,
    int? FinishingPackageId,
    string? FinishingPackageName,
    bool InstallmentAvailable,
    int? FloorNumber,
    string City,
    string District,
    string Address,
    string Status,
    bool IsFeatured,
    bool IsPublished,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? WaterMeterNumber,
    string? ElectricityMeterNumber,
    string? GasMeterNumber,
    IReadOnlyList<PropertyMediaDto> Media);

public record CreatePropertyRequest(
    [Required][MaxLength(200)] string Title,
    [Required][MaxLength(4000)] string Description,
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")] decimal Price,
    [Range(1, double.MaxValue, ErrorMessage = "Area must be greater than 0")] decimal AreaSqm,
    [Range(0, 100)] int Bedrooms,
    [Range(0, 50)] int Bathrooms,
    [Required][MaxLength(50)] string PropertyType,
    [Required][MaxLength(20)] string ListingType,
    [Required][MaxLength(50)] string FinishingStatus,
    int? FinishingPackageId,
    bool InstallmentAvailable,
    int? FloorNumber,
    [Required][MaxLength(100)] string City,
    [MaxLength(100)] string District,
    [MaxLength(300)] string Address,
    [Required][MaxLength(20)] string Status,
    bool IsFeatured,
    bool IsPublished,
    [MaxLength(50)] string? WaterMeterNumber = null,
    [MaxLength(50)] string? ElectricityMeterNumber = null,
    [MaxLength(50)] string? GasMeterNumber = null);

public record UpdatePropertyRequest(
    [Required][MaxLength(200)] string Title,
    [Required][MaxLength(4000)] string Description,
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")] decimal Price,
    [Range(0, double.MaxValue)] decimal? SoldPrice,
    [Range(1, double.MaxValue, ErrorMessage = "Area must be greater than 0")] decimal AreaSqm,
    [Range(0, 100)] int Bedrooms,
    [Range(0, 50)] int Bathrooms,
    [Required][MaxLength(50)] string PropertyType,
    [Required][MaxLength(20)] string ListingType,
    [Required][MaxLength(50)] string FinishingStatus,
    int? FinishingPackageId,
    bool InstallmentAvailable,
    int? FloorNumber,
    [Required][MaxLength(100)] string City,
    [MaxLength(100)] string District,
    [MaxLength(300)] string Address,
    [Required][MaxLength(20)] string Status,
    bool IsFeatured,
    bool IsPublished,
    [MaxLength(50)] string? WaterMeterNumber = null,
    [MaxLength(50)] string? ElectricityMeterNumber = null,
    [MaxLength(50)] string? GasMeterNumber = null);

public record AddPropertyMediaRequest(
    string MediaType,
    string CloudinaryPublicId,
    string Url,
    int SortOrder);

public record PropertyQuery(
    string? City = null,
    string? PropertyType = null,
    string? ListingType = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    decimal? MinArea = null,
    decimal? MaxArea = null,
    int? Bedrooms = null,
    bool? IsFeatured = null,
    int Page = 1,
    int PageSize = 12);

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
