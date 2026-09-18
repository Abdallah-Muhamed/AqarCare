using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AqarCare.Services;

/// <summary>
/// Stores and exposes map data without choosing a map provider, geometry format,
/// or visual rendering technology.
/// </summary>
public class MapService
{
    private readonly AqarCareDbContext _db;

    public MapService(AqarCareDbContext db) => _db = db;

    public async Task<IReadOnlyList<MapCityListItemDto>> GetActiveCitiesAsync(CancellationToken ct = default) =>
        await _db.MapCities.AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .Select(x => new MapCityListItemDto(x.Id, x.Name, x.Slug))
            .ToListAsync(ct);

    public async Task<CityMapDto?> GetPublicMapAsync(string slug, PropertyQuery query, CancellationToken ct = default)
    {
        var city = await _db.MapCities.AsNoTracking()
            .Include(x => x.Streets.Where(s => s.IsActive)).ThenInclude(s => s.Aliases)
            .FirstOrDefaultAsync(x => x.Slug == slug && x.IsActive, ct);
        if (city is null) return null;

        IQueryable<PropertyMapLocation> locations = _db.PropertyMapLocations.AsNoTracking()
            .Include(x => x.PropertyUnit).ThenInclude(x => x.Media)
            .Where(x => x.MapStreet.MapCityId == city.Id && x.MapStreet.IsActive && x.PropertyUnit.IsPublished);

        locations = ApplyPropertyFilters(locations, query);
        var properties = await locations
            .OrderByDescending(x => x.PropertyUnit.IsFeatured)
            .ThenByDescending(x => x.PropertyUnit.CreatedAt)
            .Select(x => new MapPropertyDto(
                x.PropertyUnitId,
                x.PropertyUnit.Title,
                x.PropertyUnit.Price,
                x.PropertyUnit.AreaSqm,
                x.PropertyUnit.PropertyType,
                x.PropertyUnit.ListingType,
                x.PropertyUnit.Status,
                x.PropertyUnit.Media.OrderBy(m => m.SortOrder).Where(m => m.MediaType == "Image").Select(m => m.Url).FirstOrDefault()
                    ?? x.PropertyUnit.Media.OrderBy(m => m.SortOrder).Select(m => m.Url).FirstOrDefault(),
                x.X,
                x.Y,
                x.MapStreetId,
                x.PropertyUnit.Bedrooms,
                x.PropertyUnit.Bathrooms,
                x.PropertyUnit.FloorNumber,
                x.PropertyUnit.FinishingStatus,
                x.PropertyUnit.Address,
                x.PropertyUnit.WaterMeterAvailable,
                x.PropertyUnit.ElectricityMeterAvailable,
                x.PropertyUnit.GasMeterAvailable,
                x.PropertyUnit.ElevatorAvailable,
                x.PropertyUnit.InstallmentAvailable,
                x.PropertyUnit.InstallmentPrice,
                x.PropertyUnit.IsUnderConstruction,
                x.PropertyUnit.ApartmentsPerFloor,
                x.PropertyUnit.Floors.OrderBy(f => f.SortOrder).Select(f => new PropertyFloorDto(
                    f.Id,
                    f.FloorNumber,
                    f.FloorName,
                    f.Price,
                    f.PricePerMeter,
                    f.InstallmentPrice,
                    f.SoldPrice,
                    f.AreaSqm,
                    f.IsAvailable,
                    f.SortOrder,
                    f.FinishingStatus)).ToList()))
            .ToListAsync(ct);

        return new CityMapDto(
            city.Id,
            city.Name,
            city.Slug,
            city.Streets.OrderBy(x => x.SortOrder).ThenBy(x => x.Name)
                .Select(ToStreetDto).ToList(),
            properties);
    }

    public async Task<IReadOnlyList<MapCityListItemDto>> GetAllCitiesAsync(CancellationToken ct = default) =>
        await _db.MapCities.AsNoTracking().OrderBy(x => x.Name)
            .Select(x => new MapCityListItemDto(x.Id, x.Name, x.Slug)).ToListAsync(ct);

    public async Task<MapCityListItemDto> CreateCityAsync(CreateMapCityRequest request, CancellationToken ct = default)
    {
        var city = new MapCity { Name = request.Name.Trim(), Slug = request.Slug.Trim(), IsActive = request.IsActive };
        _db.MapCities.Add(city);
        await _db.SaveChangesAsync(ct);
        return new MapCityListItemDto(city.Id, city.Name, city.Slug);
    }

    public async Task<MapCityListItemDto?> UpdateCityAsync(int id, UpdateMapCityRequest request, CancellationToken ct = default)
    {
        var city = await _db.MapCities.FindAsync([id], ct);
        if (city is null) return null;
        city.Name = request.Name.Trim();
        city.Slug = request.Slug.Trim();
        city.IsActive = request.IsActive;
        city.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return new MapCityListItemDto(city.Id, city.Name, city.Slug);
    }

    public async Task<bool> DeleteCityAsync(int id, CancellationToken ct = default)
    {
        var city = await _db.MapCities.FindAsync([id], ct);
        if (city is null) return false;
        _db.MapCities.Remove(city);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<MapStreetDto>?> GetStreetsAsync(int cityId, CancellationToken ct = default)
    {
        if (!await _db.MapCities.AnyAsync(x => x.Id == cityId, ct)) return null;
        var streets = await _db.MapStreets.AsNoTracking().Where(x => x.MapCityId == cityId)
            .Include(x => x.Aliases)
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Name)
            .ToListAsync(ct);
        return streets.Select(ToStreetDto).ToList();
    }

    public async Task<MapStreetDto?> CreateStreetAsync(int cityId, CreateMapStreetRequest request, CancellationToken ct = default)
    {
        if (!await _db.MapCities.AnyAsync(x => x.Id == cityId, ct)) return null;
        var street = new MapStreet
        {
            MapCityId = cityId, Name = request.Name.Trim(), WidthMeters = request.WidthMeters,
            LengthMeters = request.LengthMeters, StreetType = request.StreetType, TrafficDirection = request.TrafficDirection,
            SurfaceType = request.SurfaceType, Importance = request.Importance, GeometryJson = request.GeometryJson,
            AttributesJson = request.AttributesJson, SortOrder = request.SortOrder, IsActive = request.IsActive,
            Aliases = CreateAliases(request.Aliases)
        };
        _db.MapStreets.Add(street);
        await _db.SaveChangesAsync(ct);
        return ToStreetDto(street);
    }

    public async Task<MapStreetDto?> UpdateStreetAsync(int id, UpdateMapStreetRequest request, CancellationToken ct = default)
    {
        var street = await _db.MapStreets.Include(x => x.Aliases).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (street is null) return null;
        street.Name = request.Name.Trim();
        street.WidthMeters = request.WidthMeters;
        street.LengthMeters = request.LengthMeters;
        street.StreetType = request.StreetType;
        street.TrafficDirection = request.TrafficDirection;
        street.SurfaceType = request.SurfaceType;
        street.Importance = request.Importance;
        street.GeometryJson = request.GeometryJson;
        street.AttributesJson = request.AttributesJson;
        street.SortOrder = request.SortOrder;
        street.IsActive = request.IsActive;
        street.UpdatedAt = DateTime.UtcNow;
        _db.MapStreetAliases.RemoveRange(street.Aliases);
        street.Aliases = CreateAliases(request.Aliases);
        await _db.SaveChangesAsync(ct);
        return ToStreetDto(street);
    }

    public async Task<bool> DeleteStreetAsync(int id, CancellationToken ct = default)
    {
        var street = await _db.MapStreets.Include(x => x.PropertyLocations).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (street is null) return false;
        if (street.PropertyLocations.Count > 0) throw new InvalidOperationException("A street with assigned properties cannot be deleted.");
        _db.MapStreets.Remove(street);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> SetPropertyLocationAsync(int propertyId, SetPropertyMapLocationRequest request, CancellationToken ct = default)
    {
        if (!await _db.PropertyUnits.AnyAsync(x => x.Id == propertyId, ct)
            || !await _db.MapStreets.AnyAsync(x => x.Id == request.MapStreetId, ct)) return false;

        var location = await _db.PropertyMapLocations.FirstOrDefaultAsync(x => x.PropertyUnitId == propertyId, ct);
        if (location is null)
        {
            location = new PropertyMapLocation { PropertyUnitId = propertyId, MapStreetId = request.MapStreetId, X = request.X, Y = request.Y };
            _db.PropertyMapLocations.Add(location);
        }
        else
        {
            location.MapStreetId = request.MapStreetId;
            location.X = request.X;
            location.Y = request.Y;
            location.UpdatedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> RemovePropertyLocationAsync(int propertyId, CancellationToken ct = default)
    {
        var location = await _db.PropertyMapLocations.FirstOrDefaultAsync(x => x.PropertyUnitId == propertyId, ct);
        if (location is null) return false;
        _db.PropertyMapLocations.Remove(location);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private static IQueryable<PropertyMapLocation> ApplyPropertyFilters(IQueryable<PropertyMapLocation> query, PropertyQuery filters)
    {
        if (!string.IsNullOrWhiteSpace(filters.PropertyType)) query = query.Where(x => x.PropertyUnit.PropertyType == filters.PropertyType);
        if (!string.IsNullOrWhiteSpace(filters.ListingType)) query = query.Where(x => x.PropertyUnit.ListingType == filters.ListingType);
        if (!string.IsNullOrWhiteSpace(filters.FinishingStatus)) query = query.Where(x => x.PropertyUnit.FinishingStatus == filters.FinishingStatus);
        if (filters.MinPrice.HasValue) query = query.Where(x => x.PropertyUnit.Price >= filters.MinPrice.Value);
        if (filters.MaxPrice.HasValue) query = query.Where(x => x.PropertyUnit.Price <= filters.MaxPrice.Value);
        if (filters.MinArea.HasValue) query = query.Where(x => x.PropertyUnit.AreaSqm >= filters.MinArea.Value);
        if (filters.MaxArea.HasValue) query = query.Where(x => x.PropertyUnit.AreaSqm <= filters.MaxArea.Value);
        if (filters.Bedrooms.HasValue) query = query.Where(x => x.PropertyUnit.Bedrooms >= filters.Bedrooms.Value);
        if (filters.IsFeatured.HasValue) query = query.Where(x => x.PropertyUnit.IsFeatured == filters.IsFeatured.Value);
        return query;
    }

    private static ICollection<MapStreetAlias> CreateAliases(IReadOnlyList<string>? aliases) =>
        aliases?.Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(x => new MapStreetAlias { Name = x })
            .ToList()
        ?? [];

    private static MapStreetDto ToStreetDto(MapStreet street) => new(
        street.Id,
        street.Name,
        street.Aliases.OrderBy(x => x.Name).Select(x => x.Name).ToList(),
        street.WidthMeters,
        street.LengthMeters,
        street.StreetType,
        street.TrafficDirection,
        street.SurfaceType,
        street.Importance,
        street.GeometryJson,
        street.AttributesJson,
        street.SortOrder);
}
