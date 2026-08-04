using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AqarCare.Services;

public class FinishingPackageService
{
    private readonly AqarCareDbContext _db;

    public FinishingPackageService(AqarCareDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<FinishingPackageListItemDto>> GetActiveAsync(CancellationToken ct = default)
    {
        var entities = await _db.FinishingPackages
            .AsNoTracking()
            .Include(x => x.Media.OrderBy(m => m.SortOrder))
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        return entities.Select(ToListItem).ToList();
    }

    public async Task<FinishingPackageDetailDto?> GetActiveByIdOrSlugAsync(string idOrSlug, CancellationToken ct = default)
    {
        var query = _db.FinishingPackages
            .AsNoTracking()
            .Include(x => x.PaymentPhases.OrderBy(p => p.SortOrder))
            .Include(x => x.Sections.OrderBy(s => s.SortOrder))
                .ThenInclude(s => s.FeatureItems.OrderBy(f => f.SortOrder))
            .Include(x => x.Notes.OrderBy(n => n.SortOrder))
            .Include(x => x.Media.OrderBy(m => m.SortOrder))
            .Where(x => x.IsActive);

        FinishingPackage? entity;
        if (int.TryParse(idOrSlug, out var id))
            entity = await query.FirstOrDefaultAsync(x => x.Id == id, ct);
        else
            entity = await query.FirstOrDefaultAsync(x => x.Slug == idOrSlug, ct);

        return entity is null ? null : ToDetail(entity);
    }

    public async Task<IReadOnlyList<FinishingPackageListItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        var entities = await _db.FinishingPackages
            .AsNoTracking()
            .Include(x => x.Media.OrderBy(m => m.SortOrder))
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        return entities.Select(ToListItem).ToList();
    }

    public async Task<FinishingPackageDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var entity = await LoadDetailQuery().FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity is null ? null : ToDetail(entity);
    }

    public async Task<FinishingPackageDetailDto> CreateAsync(CreateFinishingPackageRequest request, CancellationToken ct = default)
    {
        var entity = new FinishingPackage
        {
            Name = request.Name,
            Slug = request.Slug,
            PricePerSqm = request.PricePerSqm,
            ShortDescription = request.ShortDescription,
            Description = request.Description,
            SupervisionPercent = request.SupervisionPercent,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        ApplyNestedData(entity, request.PaymentPhases, request.Sections, request.Notes);
        _db.FinishingPackages.Add(entity);
        await _db.SaveChangesAsync(ct);

        var created = await LoadDetailQuery().FirstAsync(x => x.Id == entity.Id, ct);
        return ToDetail(created);
    }

    public async Task<FinishingPackageDetailDto?> UpdateAsync(int id, UpdateFinishingPackageRequest request, CancellationToken ct = default)
    {
        var entity = await _db.FinishingPackages
            .Include(x => x.PaymentPhases)
            .Include(x => x.Sections).ThenInclude(s => s.FeatureItems)
            .Include(x => x.Notes)
            .Include(x => x.Media)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (entity is null) return null;

        entity.Name = request.Name;
        entity.Slug = request.Slug;
        entity.PricePerSqm = request.PricePerSqm;
        entity.ShortDescription = request.ShortDescription;
        entity.Description = request.Description;
        entity.SupervisionPercent = request.SupervisionPercent;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        _db.PackageFeatureItems.RemoveRange(entity.Sections.SelectMany(s => s.FeatureItems));
        _db.PackageSections.RemoveRange(entity.Sections);
        _db.PackagePaymentPhases.RemoveRange(entity.PaymentPhases);
        _db.PackageNotes.RemoveRange(entity.Notes);
        entity.Sections.Clear();
        entity.PaymentPhases.Clear();
        entity.Notes.Clear();

        ApplyNestedData(entity, request.PaymentPhases, request.Sections, request.Notes);
        await _db.SaveChangesAsync(ct);

        var updated = await LoadDetailQuery().FirstAsync(x => x.Id == id, ct);
        return ToDetail(updated);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.FinishingPackages.FindAsync([id], ct);
        if (entity is null) return false;

        _db.FinishingPackages.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<PropertyMediaDto?> AddMediaAsync(int packageId, AddPackageMediaRequest request, CancellationToken ct = default)
    {
        var exists = await _db.FinishingPackages.AnyAsync(x => x.Id == packageId, ct);
        if (!exists) return null;

        var media = new PackageMedia
        {
            FinishingPackageId = packageId,
            MediaType = request.MediaType,
            CloudinaryPublicId = request.CloudinaryPublicId,
            Url = request.Url,
            SortOrder = request.SortOrder
        };

        _db.PackageMedia.Add(media);
        await _db.SaveChangesAsync(ct);
        return new PropertyMediaDto(media.Id, media.MediaType, media.Url, media.SortOrder);
    }

    public async Task<bool> RemoveMediaAsync(int packageId, int mediaId, CancellationToken ct = default)
    {
        var media = await _db.PackageMedia.FirstOrDefaultAsync(x => x.Id == mediaId && x.FinishingPackageId == packageId, ct);
        if (media is null) return false;

        _db.PackageMedia.Remove(media);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private IQueryable<FinishingPackage> LoadDetailQuery() =>
        _db.FinishingPackages
            .AsNoTracking()
            .Include(x => x.PaymentPhases.OrderBy(p => p.SortOrder))
            .Include(x => x.Sections.OrderBy(s => s.SortOrder))
                .ThenInclude(s => s.FeatureItems.OrderBy(f => f.SortOrder))
            .Include(x => x.Notes.OrderBy(n => n.SortOrder))
            .Include(x => x.Media.OrderBy(m => m.SortOrder));

    private static void ApplyNestedData(
        FinishingPackage entity,
        IReadOnlyList<PackagePaymentPhaseInput>? paymentPhases,
        IReadOnlyList<PackageSectionInput>? sections,
        IReadOnlyList<PackageNoteInput>? notes)
    {
        if (paymentPhases is not null)
        {
            foreach (var phase in paymentPhases)
            {
                entity.PaymentPhases.Add(new PackagePaymentPhase
                {
                    Percentage = phase.Percentage,
                    PhaseDescription = phase.PhaseDescription,
                    SortOrder = phase.SortOrder
                });
            }
        }

        if (sections is not null)
        {
            foreach (var section in sections)
            {
                var sectionEntity = new PackageSection
                {
                    Title = section.Title,
                    SortOrder = section.SortOrder
                };

                if (section.FeatureItems is not null)
                {
                    foreach (var item in section.FeatureItems)
                    {
                        sectionEntity.FeatureItems.Add(new PackageFeatureItem
                        {
                            Text = item.Text,
                            SortOrder = item.SortOrder
                        });
                    }
                }

                entity.Sections.Add(sectionEntity);
            }
        }

        if (notes is not null)
        {
            foreach (var note in notes)
            {
                entity.Notes.Add(new PackageNote
                {
                    Text = note.Text,
                    SortOrder = note.SortOrder
                });
            }
        }
    }

    private static FinishingPackageListItemDto ToListItem(FinishingPackage x)
    {
        var primaryImage = x.Media
            .OrderBy(m => m.SortOrder)
            .FirstOrDefault(m => m.MediaType == "Image")?.Url
            ?? x.Media.OrderBy(m => m.SortOrder).FirstOrDefault()?.Url;

        return new FinishingPackageListItemDto(
            x.Id,
            x.Name,
            x.Slug,
            x.PricePerSqm,
            x.ShortDescription,
            x.SortOrder,
            primaryImage);
    }

    private static FinishingPackageDetailDto ToDetail(FinishingPackage x) =>
        new(
            x.Id,
            x.Name,
            x.Slug,
            x.PricePerSqm,
            x.ShortDescription,
            x.Description,
            x.SupervisionPercent,
            x.SortOrder,
            x.IsActive,
            x.PaymentPhases.Select(p => new PackagePaymentPhaseDto(p.Id, p.Percentage, p.PhaseDescription, p.SortOrder)).ToList(),
            x.Sections.Select(s => new PackageSectionDto(
                s.Id,
                s.Title,
                s.SortOrder,
                s.FeatureItems.Select(f => new PackageFeatureItemDto(f.Id, f.Text, f.SortOrder)).ToList())).ToList(),
            x.Notes.Select(n => new PackageNoteDto(n.Id, n.Text, n.SortOrder)).ToList(),
            x.Media.Select(m => new PropertyMediaDto(m.Id, m.MediaType, m.Url, m.SortOrder)).ToList());
}
