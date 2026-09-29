using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AqarCare.Services;

public interface IInquiryService
{
    Task<(bool Success, string? Error, PropertyInquiryDto? Result)> CreateInquiryAsync(int propertyId, CreateInquiryRequest request, int? customerId = null, CancellationToken ct = default);
    Task<IReadOnlyList<PropertyInquiryDto>> GetCustomerInquiriesAsync(int customerId, CancellationToken ct = default);
    Task<IReadOnlyList<PropertyInquiryDto>> GetAgentInquiriesAsync(int agentId, CancellationToken ct = default);
    Task<IReadOnlyList<PropertyInquiryDto>> GetAllInquiriesAsync(string? status = null, CancellationToken ct = default);
    Task<(bool Success, string? Error, PropertyInquiryDto? Result)> UpdateStatusAsync(int inquiryId, string newStatus, int userId, string userRole, CancellationToken ct = default);
}

public class InquiryService : IInquiryService
{
    private readonly AqarCareDbContext _db;
    private readonly ILogger<InquiryService> _logger;

    public InquiryService(AqarCareDbContext db, ILogger<InquiryService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<(bool Success, string? Error, PropertyInquiryDto? Result)> CreateInquiryAsync(
        int propertyId,
        CreateInquiryRequest request,
        int? customerId = null,
        CancellationToken ct = default)
    {
        var property = await _db.PropertyUnits
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == propertyId, ct);

        if (property == null)
        {
            _logger.LogWarning("Inquiry rejected: Property {PropertyId} does not exist", propertyId);
            return (false, $"Property with ID {propertyId} was not found.", null);
        }

        var inquiry = new PropertyInquiry
        {
            PropertyUnitId = propertyId,
            CustomerId = customerId,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CustomerEmail = request.CustomerEmail?.Trim(),
            Message = request.Message.Trim(),
            Status = InquiryStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.PropertyInquiries.Add(inquiry);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("New property inquiry submitted: InquiryId {InquiryId} for Property {PropertyId} by {CustomerName} ({CustomerPhone})",
            inquiry.Id, propertyId, inquiry.CustomerName, inquiry.CustomerPhone);

        var dto = new PropertyInquiryDto(
            inquiry.Id,
            propertyId,
            property.Title,
            customerId,
            inquiry.CustomerName,
            inquiry.CustomerPhone,
            inquiry.CustomerEmail,
            inquiry.Message,
            inquiry.Status,
            inquiry.CreatedAt);

        return (true, null, dto);
    }

    public async Task<IReadOnlyList<PropertyInquiryDto>> GetCustomerInquiriesAsync(int customerId, CancellationToken ct = default)
    {
        return await _db.PropertyInquiries
            .AsNoTracking()
            .Include(i => i.PropertyUnit)
            .Where(i => i.CustomerId == customerId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new PropertyInquiryDto(
                i.Id,
                i.PropertyUnitId,
                i.PropertyUnit != null ? i.PropertyUnit.Title : null,
                i.CustomerId,
                i.CustomerName,
                i.CustomerPhone,
                i.CustomerEmail,
                i.Message,
                i.Status,
                i.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<PropertyInquiryDto>> GetAgentInquiriesAsync(int agentId, CancellationToken ct = default)
    {
        // An agent sees inquiries for properties where AgentId == agentId
        return await _db.PropertyInquiries
            .AsNoTracking()
            .Include(i => i.PropertyUnit)
            .Where(i => i.PropertyUnit != null && i.PropertyUnit.AgentId == agentId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new PropertyInquiryDto(
                i.Id,
                i.PropertyUnitId,
                i.PropertyUnit != null ? i.PropertyUnit.Title : null,
                i.CustomerId,
                i.CustomerName,
                i.CustomerPhone,
                i.CustomerEmail,
                i.Message,
                i.Status,
                i.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<PropertyInquiryDto>> GetAllInquiriesAsync(string? status = null, CancellationToken ct = default)
    {
        var query = _db.PropertyInquiries
            .AsNoTracking()
            .Include(i => i.PropertyUnit)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(i => i.Status == status);
        }

        return await query
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new PropertyInquiryDto(
                i.Id,
                i.PropertyUnitId,
                i.PropertyUnit != null ? i.PropertyUnit.Title : null,
                i.CustomerId,
                i.CustomerName,
                i.CustomerPhone,
                i.CustomerEmail,
                i.Message,
                i.Status,
                i.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<(bool Success, string? Error, PropertyInquiryDto? Result)> UpdateStatusAsync(
        int inquiryId,
        string newStatus,
        int userId,
        string userRole,
        CancellationToken ct = default)
    {
        if (!InquiryStatus.IsValid(newStatus))
        {
            return (false, $"Invalid status '{newStatus}'. Allowed: {string.Join(", ", InquiryStatus.All)}", null);
        }

        var inquiry = await _db.PropertyInquiries
            .Include(i => i.PropertyUnit)
            .FirstOrDefaultAsync(i => i.Id == inquiryId, ct);

        if (inquiry == null)
        {
            return (false, $"Inquiry with ID {inquiryId} was not found.", null);
        }

        // Authorization check: Admin can update anything. Agent can only update their own property inquiries.
        var isAdmin = string.Equals(userRole, UserRoles.Admin, StringComparison.OrdinalIgnoreCase);
        var isAssignedAgent = inquiry.PropertyUnit != null && inquiry.PropertyUnit.AgentId == userId;

        if (!isAdmin && !isAssignedAgent)
        {
            _logger.LogWarning("Unauthorized inquiry update attempt: UserId {UserId} [{Role}] tried to update Inquiry {InquiryId}",
                userId, userRole, inquiryId);
            return (false, "You do not have permission to manage this inquiry.", null);
        }

        var oldStatus = inquiry.Status;
        inquiry.Status = newStatus;
        inquiry.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Inquiry {InquiryId} status transitioned from '{OldStatus}' to '{NewStatus}' by User {UserId} [{Role}]",
            inquiryId, oldStatus, newStatus, userId, userRole);

        var dto = new PropertyInquiryDto(
            inquiry.Id,
            inquiry.PropertyUnitId,
            inquiry.PropertyUnit?.Title,
            inquiry.CustomerId,
            inquiry.CustomerName,
            inquiry.CustomerPhone,
            inquiry.CustomerEmail,
            inquiry.Message,
            inquiry.Status,
            inquiry.CreatedAt);

        return (true, null, dto);
    }
}
