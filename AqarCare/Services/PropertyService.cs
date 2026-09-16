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
            .Include(x => x.Floors.OrderBy(f => f.SortOrder))
            .Where(x => x.IsPublished);

        if (!string.IsNullOrWhiteSpace(query.City))
            q = q.Where(x => x.City == query.City);
        if (!string.IsNullOrWhiteSpace(query.District))
            q = q.Where(x => x.District == query.District);
        if (!string.IsNullOrWhiteSpace(query.PropertyType))
            q = q.Where(x => x.PropertyType == query.PropertyType);
        if (!string.IsNullOrWhiteSpace(query.ListingType))
            q = q.Where(x => x.ListingType == query.ListingType);
        if (!string.IsNullOrWhiteSpace(query.FinishingStatus))
            q = q.Where(x => x.FinishingStatus == query.FinishingStatus);
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
        if (query.Bathrooms.HasValue)
            q = q.Where(x => x.Bathrooms >= query.Bathrooms.Value);
        if (query.ElevatorAvailable.HasValue)
            q = q.Where(x => x.ElevatorAvailable == query.ElevatorAvailable.Value);
        if (query.InstallmentAvailable.HasValue)
            q = q.Where(x => x.InstallmentAvailable == query.InstallmentAvailable.Value);
        if (query.IsUnderConstruction.HasValue)
            q = q.Where(x => x.IsUnderConstruction == query.IsUnderConstruction.Value);
        if (query.IsFeatured.HasValue)
            q = q.Where(x => x.IsFeatured == query.IsFeatured.Value);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim();
            q = q.Where(x => (x.Title != null && x.Title.Contains(s))
                          || (x.Address != null && x.Address.Contains(s))
                          || (x.DetailedAddress != null && x.DetailedAddress.Contains(s))
                          || (x.District != null && x.District.Contains(s))
                          || (x.Description != null && x.Description.Contains(s)));
        }

        var total = await q.CountAsync(ct);

        IOrderedQueryable<PropertyUnit> orderedQ = query.SortBy switch
        {
            "price_asc"  => q.OrderBy(x => x.Price ?? 0),
            "price_desc" => q.OrderByDescending(x => x.Price ?? 0),
            "area_desc"  => q.OrderByDescending(x => x.AreaSqm ?? 0),
            "area_asc"   => q.OrderBy(x => x.AreaSqm ?? 0),
            _            => q.OrderByDescending(x => x.IsFeatured).ThenByDescending(x => x.CreatedAt),
        };

        var entities = await orderedQ
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
            .Include(x => x.Floors.OrderBy(f => f.SortOrder))
            .FirstOrDefaultAsync(x => x.Id == id && x.IsPublished, ct);

        return entity is null ? null : ToDetail(entity);
    }

    public async Task<PagedResult<PropertyListItemDto>> GetAllAsync(PropertyQuery query, CancellationToken ct = default)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 or > 100 ? 12 : query.PageSize;

        IQueryable<PropertyUnit> q = _db.PropertyUnits
            .AsNoTracking()
            .Include(x => x.Media)
            .Include(x => x.Floors.OrderBy(f => f.SortOrder));

        if (!string.IsNullOrWhiteSpace(query.City))
            q = q.Where(x => x.City == query.City);
        if (!string.IsNullOrWhiteSpace(query.District))
            q = q.Where(x => x.District == query.District);
        if (!string.IsNullOrWhiteSpace(query.PropertyType))
            q = q.Where(x => x.PropertyType == query.PropertyType);
        if (!string.IsNullOrWhiteSpace(query.ListingType))
            q = q.Where(x => x.ListingType == query.ListingType);
        if (!string.IsNullOrWhiteSpace(query.FinishingStatus))
            q = q.Where(x => x.FinishingStatus == query.FinishingStatus);
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
        if (query.Bathrooms.HasValue)
            q = q.Where(x => x.Bathrooms >= query.Bathrooms.Value);
        if (query.ElevatorAvailable.HasValue)
            q = q.Where(x => x.ElevatorAvailable == query.ElevatorAvailable.Value);
        if (query.InstallmentAvailable.HasValue)
            q = q.Where(x => x.InstallmentAvailable == query.InstallmentAvailable.Value);
        if (query.IsUnderConstruction.HasValue)
            q = q.Where(x => x.IsUnderConstruction == query.IsUnderConstruction.Value);
        if (query.IsFeatured.HasValue)
            q = q.Where(x => x.IsFeatured == query.IsFeatured.Value);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim();
            q = q.Where(x => (x.Title != null && x.Title.Contains(s))
                          || (x.Address != null && x.Address.Contains(s))
                          || (x.DetailedAddress != null && x.DetailedAddress.Contains(s))
                          || (x.District != null && x.District.Contains(s))
                          || (x.Description != null && x.Description.Contains(s)));
        }

        var total = await q.CountAsync(ct);

        IOrderedQueryable<PropertyUnit> orderedQ = query.SortBy switch
        {
            "price_asc"  => q.OrderBy(x => x.Price ?? 0),
            "price_desc" => q.OrderByDescending(x => x.Price ?? 0),
            "area_desc"  => q.OrderByDescending(x => x.AreaSqm ?? 0),
            "area_asc"   => q.OrderBy(x => x.AreaSqm ?? 0),
            _            => q.OrderByDescending(x => x.IsFeatured).ThenByDescending(x => x.CreatedAt),
        };

        var entities = await orderedQ
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
            .Include(x => x.Floors.OrderBy(f => f.SortOrder))
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return entity is null ? null : ToDetail(entity);
    }

    public async Task<PropertyDetailDto> CreateAsync(CreatePropertyRequest request, CancellationToken ct = default)
    {
        var firstFloorPrice = request.Floors?.FirstOrDefault(f => f.Price.HasValue)?.Price;
        var firstFloorInstallment = request.Floors?.FirstOrDefault(f => f.InstallmentPrice.HasValue)?.InstallmentPrice;

        var entity = new PropertyUnit
        {
            Title = request.Title,
            Description = request.Description,
            Price = request.Price ?? firstFloorPrice,
            InstallmentPrice = request.InstallmentPrice ?? firstFloorInstallment,
            AreaSqm = request.AreaSqm,
            Bedrooms = request.Bedrooms,
            Bathrooms = request.Bathrooms,
            PropertyType = request.PropertyType,
            ListingType = request.ListingType,
            FinishingStatus = request.FinishingStatus,
            FinishingPackageId = request.FinishingPackageId,
            InstallmentAvailable = request.InstallmentAvailable,
            FloorNumber = request.FloorNumber,
            City = string.IsNullOrWhiteSpace(request.City) ? "المحلة الكبرى" : request.City,
            District = request.District,
            Address = request.Address,
            DetailedAddress = request.DetailedAddress,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Available" : request.Status,
            IsFeatured = request.IsFeatured,
            IsUnderConstruction = request.IsUnderConstruction,
            IsPublished = request.IsPublished,
            WaterMeterAvailable = request.WaterMeterAvailable,
            ElectricityMeterAvailable = request.ElectricityMeterAvailable,
            GasMeterAvailable = request.GasMeterAvailable,
            ElevatorAvailable = request.ElevatorAvailable,
            NumberOfFloors = request.NumberOfFloors,
            FloorsFinishing = request.FloorsFinishing,
            ApartmentsPerFloor = request.ApartmentsPerFloor,
            FrontageWidth = request.FrontageWidth,
            FrontageLength = request.FrontageLength,
            StreetWidth = request.StreetWidth,
            HasElectricity = request.HasElectricity,
            HasWater = request.HasWater,
            HasSewerage = request.HasSewerage,
            HasGas = request.HasGas,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.Floors != null && request.Floors.Count > 0)
        {
            var sort = 0;
            foreach (var f in request.Floors)
            {
                var floorPrice = f.Price;
                var floorPpm = f.PricePerMeter;
                if (!floorPpm.HasValue && f.AreaSqm.HasValue && f.AreaSqm.Value > 0)
                {
                    var basePrice = floorPrice ?? f.InstallmentPrice;
                    if (basePrice.HasValue)
                    {
                        floorPpm = Math.Round(basePrice.Value / f.AreaSqm.Value, 2);
                    }
                }
                else if (!floorPrice.HasValue && !f.InstallmentPrice.HasValue && floorPpm.HasValue && f.AreaSqm.HasValue && f.AreaSqm.Value > 0)
                {
                    floorPrice = Math.Round(floorPpm.Value * f.AreaSqm.Value, 2);
                }

                entity.Floors.Add(new PropertyFloor
                {
                    FloorNumber = f.FloorNumber,
                    FloorName = f.FloorName,
                    Price = floorPrice,
                    PricePerMeter = floorPpm,
                    InstallmentPrice = f.InstallmentPrice,
                    SoldPrice = f.SoldPrice,
                    AreaSqm = f.AreaSqm,
                    Bedrooms = f.Bedrooms,
                    Bathrooms = f.Bathrooms,
                    IsAvailable = f.IsAvailable,
                    SortOrder = f.SortOrder != 0 ? f.SortOrder : sort++
                });
            }

            if (entity.Floors.Any(fl => fl.Price.HasValue && fl.Price.Value > 0))
            {
                entity.Price = entity.Floors.Where(fl => fl.Price.HasValue && fl.Price.Value > 0).Min(fl => fl.Price);
            }
            if (entity.Floors.Any(fl => fl.InstallmentPrice.HasValue && fl.InstallmentPrice.Value > 0))
            {
                entity.InstallmentPrice = entity.Floors.Where(fl => fl.InstallmentPrice.HasValue && fl.InstallmentPrice.Value > 0).Min(fl => fl.InstallmentPrice);
            }
        }

        _db.PropertyUnits.Add(entity);
        await _db.SaveChangesAsync(ct);

        // Reload with all navigations so the response is complete
        var created = await _db.PropertyUnits
            .AsNoTracking()
            .Include(x => x.Media.OrderBy(m => m.SortOrder))
            .Include(x => x.FinishingPackage)
            .Include(x => x.Floors.OrderBy(f => f.SortOrder))
            .FirstAsync(x => x.Id == entity.Id, ct);
        return ToDetail(created);
    }

    public async Task<PropertyDetailDto?> UpdateAsync(int id, UpdatePropertyRequest request, CancellationToken ct = default)
    {
        var entity = await _db.PropertyUnits
            .Include(x => x.Floors)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (entity is null) return null;

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.Price = request.Price;
        entity.InstallmentPrice = request.InstallmentPrice;
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
        entity.City = string.IsNullOrWhiteSpace(request.City) ? "المحلة الكبرى" : request.City;
        entity.District = request.District;
        entity.Address = request.Address;
        entity.DetailedAddress = request.DetailedAddress;
        entity.Status = string.IsNullOrWhiteSpace(request.Status) ? "Available" : request.Status;
        entity.IsFeatured = request.IsFeatured;
        entity.IsUnderConstruction = request.IsUnderConstruction;
        entity.IsPublished = request.IsPublished;
        entity.WaterMeterAvailable = request.WaterMeterAvailable;
        entity.ElectricityMeterAvailable = request.ElectricityMeterAvailable;
        entity.GasMeterAvailable = request.GasMeterAvailable;
        entity.ElevatorAvailable = request.ElevatorAvailable;
        entity.NumberOfFloors = request.NumberOfFloors;
        entity.FloorsFinishing = request.FloorsFinishing;
        entity.ApartmentsPerFloor = request.ApartmentsPerFloor;
        entity.FrontageWidth = request.FrontageWidth;
        entity.FrontageLength = request.FrontageLength;
        entity.StreetWidth = request.StreetWidth;
        entity.HasElectricity = request.HasElectricity;
        entity.HasWater = request.HasWater;
        entity.HasSewerage = request.HasSewerage;
        entity.HasGas = request.HasGas;
        entity.UpdatedAt = DateTime.UtcNow;

        if (request.Floors != null)
        {
            var inputFloorIds = request.Floors
                .Where(f => f.Id.HasValue && f.Id.Value > 0)
                .Select(f => f.Id!.Value)
                .ToHashSet();

            var toRemove = entity.Floors.Where(f => !inputFloorIds.Contains(f.Id)).ToList();
            foreach (var r in toRemove)
            {
                _db.PropertyFloors.Remove(r);
            }

            var sort = 0;
            foreach (var inputFloor in request.Floors)
            {
                var floorPrice = inputFloor.Price;
                var floorPpm = inputFloor.PricePerMeter;
                if (!floorPpm.HasValue && inputFloor.AreaSqm.HasValue && inputFloor.AreaSqm.Value > 0)
                {
                    var basePrice = floorPrice ?? inputFloor.InstallmentPrice;
                    if (basePrice.HasValue)
                    {
                        floorPpm = Math.Round(basePrice.Value / inputFloor.AreaSqm.Value, 2);
                    }
                }
                else if (!floorPrice.HasValue && !inputFloor.InstallmentPrice.HasValue && floorPpm.HasValue && inputFloor.AreaSqm.HasValue && inputFloor.AreaSqm.Value > 0)
                {
                    floorPrice = Math.Round(floorPpm.Value * inputFloor.AreaSqm.Value, 2);
                }

                if (inputFloor.Id.HasValue && inputFloor.Id.Value > 0)
                {
                    var existingFloor = entity.Floors.FirstOrDefault(f => f.Id == inputFloor.Id.Value);
                    if (existingFloor != null)
                    {
                        existingFloor.FloorNumber = inputFloor.FloorNumber;
                        existingFloor.FloorName = inputFloor.FloorName;
                        existingFloor.Price = floorPrice;
                        existingFloor.PricePerMeter = floorPpm;
                        existingFloor.InstallmentPrice = inputFloor.InstallmentPrice;
                        existingFloor.SoldPrice = inputFloor.SoldPrice;
                        existingFloor.AreaSqm = inputFloor.AreaSqm;
                        existingFloor.Bedrooms = inputFloor.Bedrooms;
                        existingFloor.Bathrooms = inputFloor.Bathrooms;
                        existingFloor.IsAvailable = inputFloor.IsAvailable;
                        existingFloor.SortOrder = inputFloor.SortOrder != 0 ? inputFloor.SortOrder : sort++;
                    }
                }
                else
                {
                    entity.Floors.Add(new PropertyFloor
                    {
                        PropertyUnitId = entity.Id,
                        FloorNumber = inputFloor.FloorNumber,
                        FloorName = inputFloor.FloorName,
                        Price = floorPrice,
                        PricePerMeter = floorPpm,
                        InstallmentPrice = inputFloor.InstallmentPrice,
                        SoldPrice = inputFloor.SoldPrice,
                        AreaSqm = inputFloor.AreaSqm,
                        Bedrooms = inputFloor.Bedrooms,
                        Bathrooms = inputFloor.Bathrooms,
                        IsAvailable = inputFloor.IsAvailable,
                        SortOrder = inputFloor.SortOrder != 0 ? inputFloor.SortOrder : sort++
                    });
                }
            }

            if (entity.Floors.Any(fl => fl.Price.HasValue && fl.Price.Value > 0))
            {
                entity.Price = entity.Floors.Where(fl => fl.Price.HasValue && fl.Price.Value > 0).Min(fl => fl.Price);
            }
            if (entity.Floors.Any(fl => fl.InstallmentPrice.HasValue && fl.InstallmentPrice.Value > 0))
            {
                entity.InstallmentPrice = entity.Floors.Where(fl => fl.InstallmentPrice.HasValue && fl.InstallmentPrice.Value > 0).Min(fl => fl.InstallmentPrice);
            }
        }

        await _db.SaveChangesAsync(ct);

        // Reload with all navigations so the response is complete
        var updated = await _db.PropertyUnits
            .AsNoTracking()
            .Include(x => x.Media.OrderBy(m => m.SortOrder))
            .Include(x => x.FinishingPackage)
            .Include(x => x.Floors.OrderBy(f => f.SortOrder))
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

    public static PropertyListItemDto ToListItem(PropertyUnit x) =>
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
            x.Address,
            x.DetailedAddress,
            x.Status,
            x.IsFeatured,
            x.Media.OrderBy(m => m.SortOrder).FirstOrDefault(m => m.MediaType == "Image")?.Url
                ?? x.Media.OrderBy(m => m.SortOrder).FirstOrDefault()?.Url,
            x.WaterMeterAvailable,
            x.ElectricityMeterAvailable,
            x.GasMeterAvailable,
            x.ElevatorAvailable,
            x.NumberOfFloors,
            x.FloorsFinishing,
            x.FrontageWidth,
            x.FrontageLength,
            x.StreetWidth,
            x.HasElectricity,
            x.HasWater,
            x.HasSewerage,
            x.HasGas,
            x.InstallmentPrice,
            x.IsUnderConstruction,
            x.Floors?.OrderBy(f => f.SortOrder)
                .Select(f => new PropertyFloorDto(f.Id, f.FloorNumber, f.FloorName, f.Price, f.PricePerMeter, f.InstallmentPrice, f.SoldPrice, f.AreaSqm, f.IsAvailable, f.SortOrder, f.Bedrooms, f.Bathrooms))
                .ToList(),
            x.IsPublished,
            x.ApartmentsPerFloor);

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
            x.DetailedAddress,
            x.Status,
            x.IsFeatured,
            x.IsPublished,
            x.CreatedAt,
            x.UpdatedAt,
            x.WaterMeterAvailable,
            x.ElectricityMeterAvailable,
            x.GasMeterAvailable,
            x.ElevatorAvailable,
            x.NumberOfFloors,
            x.FloorsFinishing,
            x.FrontageWidth,
            x.FrontageLength,
            x.StreetWidth,
            x.HasElectricity,
            x.HasWater,
            x.HasSewerage,
            x.HasGas,
            x.Media
                .OrderBy(m => m.SortOrder)
                .Select(m => new PropertyMediaDto(m.Id, m.MediaType, m.Url, m.SortOrder))
                .ToList(),
            x.InstallmentPrice,
            x.IsUnderConstruction,
            x.Floors?
                .OrderBy(f => f.SortOrder)
                .Select(f => new PropertyFloorDto(f.Id, f.FloorNumber, f.FloorName, f.Price, f.PricePerMeter, f.InstallmentPrice, f.SoldPrice, f.AreaSqm, f.IsAvailable, f.SortOrder, f.Bedrooms, f.Bathrooms))
                .ToList() ?? new List<PropertyFloorDto>(),
            x.ApartmentsPerFloor);
}
