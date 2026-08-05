using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AqarCare.Services;

public class PropertyService
{
    private readonly AqarCareDbContext _db;

    public PropertyService(AqarCareDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<PropertyListItemDto>> GetPublishedAsync(PropertyQuery query, CancellationToken ct = default)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 or > 100 ? 12 : query.PageSize;

        IQueryable<PropertyUnit> q = _db.PropertyUnits
            .AsNoTracking()
            .Include(x => x.Media)
            .Where(x => x.IsPublished);

        if (!string.IsNullOrWhiteSpace(query.City))
            q = q.Where(x => x.City == query.City);
        if (!string.IsNullOrWhiteSpace(query.PropertyType))
            q = q.Where(x => x.PropertyType == query.PropertyType);
        if (!string.IsNullOrWhiteSpace(query.ListingType))
            q = q.Where(x => x.ListingType == query.ListingType);
        if (query.MinPrice.HasValue)
            q = q.Where(x => x.Price >= query.MinPrice.Value);
        if (query.MaxPrice.HasValue)
            q = q.Where(x => x.Price <= query.MaxPrice.Value);
        if (query.MinArea.HasValue)
            q = q.Where(x => x.AreaSqm >= query.MinArea.Value);
        if (query.MaxArea.HasValue)
            q = q.Where(x => x.AreaSqm <= query.MaxArea.Value);
        if (query.Bedrooms.HasValue)
            q = q.Where(x => x.Bedrooms >= query.Bedrooms.Value);
        if (query.IsFeatured.HasValue)
            q = q.Where(x => x.IsFeatured == query.IsFeatured.Value);

        var total = await q.CountAsync(ct);
        var entities = await q
            .OrderByDescending(x => x.IsFeatured)
            .ThenByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = entities.Select(ToListItem).ToList();
        return new PagedResult<PropertyListItemDto>(items, total, page, pageSize);
    }

    public async Task<PropertyDetailDto?> GetPublishedByIdAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.PropertyUnits
            .AsNoTracking()
            .Include(x => x.Media.OrderBy(m => m.SortOrder))
            .Include(x => x.FinishingPackage)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsPublished, ct);

        return entity is null ? null : ToDetail(entity);
    }

    public async Task<PagedResult<PropertyListItemDto>> GetAllAsync(PropertyQuery query, CancellationToken ct = default)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 or > 100 ? 12 : query.PageSize;

        IQueryable<PropertyUnit> q = _db.PropertyUnits.AsNoTracking().Include(x => x.Media);

        if (!string.IsNullOrWhiteSpace(query.City))
            q = q.Where(x => x.City == query.City);
        if (!string.IsNullOrWhiteSpace(query.PropertyType))
            q = q.Where(x => x.PropertyType == query.PropertyType);
        if (!string.IsNullOrWhiteSpace(query.ListingType))
            q = q.Where(x => x.ListingType == query.ListingType);
        if (query.MinPrice.HasValue)
            q = q.Where(x => x.Price >= query.MinPrice.Value);
        if (query.MaxPrice.HasValue)
            q = q.Where(x => x.Price <= query.MaxPrice.Value);
        if (query.MinArea.HasValue)
            q = q.Where(x => x.AreaSqm >= query.MinArea.Value);
        if (query.MaxArea.HasValue)
            q = q.Where(x => x.AreaSqm <= query.MaxArea.Value);
        if (query.Bedrooms.HasValue)
            q = q.Where(x => x.Bedrooms >= query.Bedrooms.Value);
        if (query.IsFeatured.HasValue)
            q = q.Where(x => x.IsFeatured == query.IsFeatured.Value);

        var total = await q.CountAsync(ct);
        var entities = await q
            .OrderByDescending(x => x.IsFeatured)
            .ThenByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = entities.Select(ToListItem).ToList();
        return new PagedResult<PropertyListItemDto>(items, total, page, pageSize);
    }

    public async Task<PropertyDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.PropertyUnits
            .AsNoTracking()
            .Include(x => x.Media.OrderBy(m => m.SortOrder))
            .Include(x => x.FinishingPackage)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return entity is null ? null : ToDetail(entity);
    }

    public async Task<PropertyDetailDto> CreateAsync(CreatePropertyRequest request, CancellationToken ct = default)
    {
        var entity = new PropertyUnit
        {
            Title = request.Title,
            Description = request.Description,
            Price = request.Price,
            AreaSqm = request.AreaSqm,
            Bedrooms = request.Bedrooms,
            Bathrooms = request.Bathrooms,
            PropertyType = request.PropertyType,
            ListingType = request.ListingType,
            FinishingStatus = request.FinishingStatus,
            FinishingPackageId = request.FinishingPackageId,
            InstallmentAvailable = request.InstallmentAvailable,
            FloorNumber = request.FloorNumber,
            City = request.City,
            District = request.District,
            Address = request.Address,
            Status = request.Status,
            IsFeatured = request.IsFeatured,
            IsPublished = request.IsPublished,
            WaterMeterNumber = request.WaterMeterNumber,
            ElectricityMeterNumber = request.ElectricityMeterNumber,
            GasMeterNumber = request.GasMeterNumber,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.PropertyUnits.Add(entity);
        await _db.SaveChangesAsync(ct);

        // Reload with all navigations so the response is complete
        var created = await _db.PropertyUnits
            .AsNoTracking()
            .Include(x => x.Media.OrderBy(m => m.SortOrder))
            .Include(x => x.FinishingPackage)
            .FirstAsync(x => x.Id == entity.Id, ct);
        return ToDetail(created);
    }

    public async Task<PropertyDetailDto?> UpdateAsync(int id, UpdatePropertyRequest request, CancellationToken ct = default)
    {
        var entity = await _db.PropertyUnits
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (entity is null) return null;

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.Price = request.Price;
        entity.SoldPrice = request.SoldPrice;
        entity.AreaSqm = request.AreaSqm;
        entity.Bedrooms = request.Bedrooms;
        entity.Bathrooms = request.Bathrooms;
        entity.PropertyType = request.PropertyType;
        entity.ListingType = request.ListingType;
        entity.FinishingStatus = request.FinishingStatus;
        entity.FinishingPackageId = request.FinishingPackageId;
        entity.InstallmentAvailable = request.InstallmentAvailable;
        entity.FloorNumber = request.FloorNumber;
        entity.City = request.City;
        entity.District = request.District;
        entity.Address = request.Address;
        entity.Status = request.Status;
        entity.IsFeatured = request.IsFeatured;
        entity.IsPublished = request.IsPublished;
        entity.WaterMeterNumber = request.WaterMeterNumber;
        entity.ElectricityMeterNumber = request.ElectricityMeterNumber;
        entity.GasMeterNumber = request.GasMeterNumber;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        // Reload with all navigations so the response is complete
        var updated = await _db.PropertyUnits
            .AsNoTracking()
            .Include(x => x.Media.OrderBy(m => m.SortOrder))
            .Include(x => x.FinishingPackage)
            .FirstAsync(x => x.Id == id, ct);
        return ToDetail(updated);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.PropertyUnits.FindAsync([id], ct);
        if (entity is null) return false;

        _db.PropertyUnits.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<PropertyMediaDto?> AddMediaAsync(int propertyId, AddPropertyMediaRequest request, CancellationToken ct = default)
    {
        var exists = await _db.PropertyUnits.AnyAsync(x => x.Id == propertyId, ct);
        if (!exists) return null;

        var media = new PropertyMedia
        {
            PropertyUnitId = propertyId,
            MediaType = request.MediaType,
            CloudinaryPublicId = request.CloudinaryPublicId,
            Url = request.Url,
            SortOrder = request.SortOrder
        };

        _db.PropertyMedia.Add(media);
        await _db.SaveChangesAsync(ct);
        return new PropertyMediaDto(media.Id, media.MediaType, media.Url, media.SortOrder);
    }

    public async Task<bool> RemoveMediaAsync(int propertyId, int mediaId, CancellationToken ct = default)
    {
        var media = await _db.PropertyMedia.FirstOrDefaultAsync(x => x.Id == mediaId && x.PropertyUnitId == propertyId, ct);
        if (media is null) return false;

        _db.PropertyMedia.Remove(media);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private static PropertyListItemDto ToListItem(PropertyUnit x) =>
        new(
            x.Id,
            x.Title,
            x.Price,
            x.SoldPrice,
            x.AreaSqm,
            x.Bedrooms,
            x.Bathrooms,
            x.PropertyType,
            x.ListingType,
            x.FinishingStatus,
            x.InstallmentAvailable,
            x.FloorNumber,
            x.City,
            x.District,
            x.Status,
            x.IsFeatured,
            x.Media.OrderBy(m => m.SortOrder).FirstOrDefault(m => m.MediaType == "Image")?.Url
                ?? x.Media.OrderBy(m => m.SortOrder).FirstOrDefault()?.Url,
            x.WaterMeterNumber,
            x.ElectricityMeterNumber,
            x.GasMeterNumber);

    private static PropertyDetailDto ToDetail(PropertyUnit x) =>
        new(
            x.Id,
            x.Title,
            x.Description,
            x.Price,
            x.SoldPrice,
            x.AreaSqm,
            x.Bedrooms,
            x.Bathrooms,
            x.PropertyType,
            x.ListingType,
            x.FinishingStatus,
            x.FinishingPackageId,
            x.FinishingPackage?.Name,
            x.InstallmentAvailable,
            x.FloorNumber,
            x.City,
            x.District,
            x.Address,
            x.Status,
            x.IsFeatured,
            x.IsPublished,
            x.CreatedAt,
            x.UpdatedAt,
            x.WaterMeterNumber,
            x.ElectricityMeterNumber,
            x.GasMeterNumber,
            x.Media
                .OrderBy(m => m.SortOrder)
                .Select(m => new PropertyMediaDto(m.Id, m.MediaType, m.Url, m.SortOrder))
                .ToList());
}
