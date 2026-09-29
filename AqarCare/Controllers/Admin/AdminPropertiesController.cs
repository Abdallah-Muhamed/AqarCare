using System.Security.Claims;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using AqarCare.Filters;
using AqarCare.Services;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers.Admin;

/// <summary>
/// Administrative and broker property lifecycle endpoints.
/// Accessible by Administrators and authorized Agents.
/// </summary>
[ApiController]
[Route("api/admin/properties")]
[AdminApiKey]
[Produces("application/json")]
public class AdminPropertiesController : ControllerBase
{
    private readonly PropertyService _propertyService;
    private readonly CloudinaryService _cloudinaryService;
    private readonly ILogger<AdminPropertiesController> _logger;

    public AdminPropertiesController(
        PropertyService propertyService,
        CloudinaryService cloudinaryService,
        ILogger<AdminPropertiesController> logger)
    {
        _propertyService = propertyService;
        _cloudinaryService = cloudinaryService;
        _logger = logger;
    }

    private (int UserId, string Role, bool IsAdmin) GetUserContext()
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? (User.IsInRole(UserRoles.Admin) ? UserRoles.Admin : UserRoles.Agent);
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(idClaim, out var userId);
        var isAdmin = string.Equals(role, UserRoles.Admin, StringComparison.OrdinalIgnoreCase);
        return (userId, role, isAdmin);
    }

    /// <summary>
    /// Retrieves a paginated list of all properties, including drafts and unpublished listings.
    /// </summary>
    /// <param name="query">Filter and pagination criteria.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of properties returned successfully.</response>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<PropertyListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<PropertyListItemDto>>> GetList([FromQuery] PropertyQuery query, CancellationToken ct)
    {
        var result = await _propertyService.GetAllAsync(query, ct);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves full details of a specific property by ID for administrative inspection or editing.
    /// </summary>
    /// <param name="id">Property identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Property details found.</response>
    /// <response code="404">Property not found.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PropertyDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyDetailDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _propertyService.GetByIdAsync(id, ct);
        if (result is null)
        {
            return NotFound(new ApiErrorResponse(
                StatusCode: StatusCodes.Status404NotFound,
                Message: $"Property with ID {id} was not found.",
                TraceId: HttpContext.TraceIdentifier));
        }

        return Ok(result);
    }

    /// <summary>
    /// Creates a new property listing with complete unit attributes and floor matrix.
    /// If created by an Agent, the property is automatically associated with their Agent ID.
    /// </summary>
    /// <param name="request">Property creation payload.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="201">Property created successfully.</response>
    /// <response code="400">Payload validation failure.</response>
    [HttpPost]
    [ProducesResponseType(typeof(PropertyDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PropertyDetailDto>> Create([FromBody] CreatePropertyRequest request, CancellationToken ct)
    {
        var (userId, _, isAdmin) = GetUserContext();

        // If created by an Agent, automatically bind to their AgentId
        if (!isAdmin && userId > 0)
        {
            request = request with { AgentId = userId };
        }

        var result = await _propertyService.CreateAsync(request, ct);

        _logger.LogInformation("Property {PropertyId} created by User {UserId}", result.Id, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Updates an existing property record with optimistic concurrency validation.
    /// </summary>
    /// <param name="id">Property identifier.</param>
    /// <param name="request">Updated property fields and RowVersion token.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Property updated successfully.</response>
    /// <response code="403">Forbidden: Agent attempted to edit another agent's listing.</response>
    /// <response code="404">Property not found.</response>
    /// <response code="409">Conflict: Concurrent edit detected. Concurrency token mismatch.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PropertyDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<PropertyDetailDto>> Update(int id, [FromBody] UpdatePropertyRequest request, CancellationToken ct)
    {
        var (userId, role, isAdmin) = GetUserContext();

        var existing = await _propertyService.GetByIdAsync(id, ct);
        if (existing is null)
        {
            return NotFound(new ApiErrorResponse(
                StatusCode: StatusCodes.Status404NotFound,
                Message: $"Property with ID {id} was not found.",
                TraceId: HttpContext.TraceIdentifier));
        }

        // Authorization rule: Agents may only update their own listings
        if (!isAdmin && existing.AgentId.HasValue && existing.AgentId.Value != userId)
        {
            _logger.LogWarning("Agent {UserId} attempted unauthorized update on Property {PropertyId} owned by Agent {OwnerId}",
                userId, id, existing.AgentId);

            return StatusCode(StatusCodes.Status403Forbidden, new ApiErrorResponse(
                StatusCode: StatusCodes.Status403Forbidden,
                Message: "Forbidden: You are only authorized to modify properties assigned to your account.",
                TraceId: HttpContext.TraceIdentifier));
        }

        try
        {
            var result = await _propertyService.UpdateAsync(id, request, ct);
            return result is null ? NotFound() : Ok(result);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException)
        {
            _logger.LogWarning("Concurrency conflict updating Property {PropertyId} by User {UserId}", id, userId);
            return Conflict(new ApiErrorResponse(
                StatusCode: StatusCodes.Status409Conflict,
                Message: "Conflict detected: The property record was modified by another administrator or process. Please reload the latest data.",
                TraceId: HttpContext.TraceIdentifier));
        }
    }

    /// <summary>
    /// Approves or updates the publication status of a property (Admin approval workflow).
    /// </summary>
    /// <param name="id">Property identifier.</param>
    /// <param name="request">Publication flag.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Property publication status updated successfully.</response>
    /// <response code="404">Property not found.</response>
    [HttpPatch("{id:int}/publish")]
    [ProducesResponseType(typeof(PropertyDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyDetailDto>> SetPublished(int id, [FromBody] SetPublishedRequest request, CancellationToken ct)
    {
        var result = await _propertyService.SetPublishedAsync(id, request.IsPublished, ct);
        if (result is null)
        {
            return NotFound(new ApiErrorResponse(
                StatusCode: StatusCodes.Status404NotFound,
                Message: $"Property with ID {id} was not found.",
                TraceId: HttpContext.TraceIdentifier));
        }

        _logger.LogInformation("Property {PropertyId} publication status updated to {IsPublished}", id, request.IsPublished);
        return Ok(result);
    }

    /// <summary>
    /// Deletes a property record and invalidates active cache partitions.
    /// </summary>
    /// <param name="id">Property identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="204">Property successfully deleted.</response>
    /// <response code="403">Forbidden: Agent attempted to delete another agent's listing.</response>
    /// <response code="404">Property not found.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var (userId, _, isAdmin) = GetUserContext();

        var existing = await _propertyService.GetByIdAsync(id, ct);
        if (existing is null)
        {
            return NotFound(new ApiErrorResponse(
                StatusCode: StatusCodes.Status404NotFound,
                Message: $"Property with ID {id} was not found.",
                TraceId: HttpContext.TraceIdentifier));
        }

        // Authorization rule: Agents may only delete their own listings
        if (!isAdmin && existing.AgentId.HasValue && existing.AgentId.Value != userId)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiErrorResponse(
                StatusCode: StatusCodes.Status403Forbidden,
                Message: "Forbidden: You are only authorized to delete properties assigned to your account.",
                TraceId: HttpContext.TraceIdentifier));
        }

        var deleted = await _propertyService.DeleteAsync(id, ct);
        return deleted ? NoContent() : NotFound();
    }

    /// <summary>
    /// Associates an already uploaded media asset to a property.
    /// </summary>
    [HttpPost("{id:int}/media")]
    [ProducesResponseType(typeof(PropertyMediaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyMediaDto>> AddMedia(int id, [FromBody] AddPropertyMediaRequest request, CancellationToken ct)
    {
        var result = await _propertyService.AddMediaAsync(id, request, ct);
        return result is null ? NotFound(new ApiErrorResponse(
            StatusCode: StatusCodes.Status404NotFound,
            Message: $"Property with ID {id} was not found.",
            TraceId: HttpContext.TraceIdentifier)) : Ok(result);
    }

    /// <summary>
    /// Uploads a media file directly to Cloudinary and persists metadata with automatic compensating deletion on persistence failure.
    /// </summary>
    [HttpPost("{id:int}/media/upload")]
    [RequestSizeLimit(100_000_000)]
    [ProducesResponseType(typeof(PropertyMediaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<PropertyMediaDto>> UploadMedia(int id, IFormFile file, [FromQuery] string? folder, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new ApiErrorResponse(
                StatusCode: StatusCodes.Status400BadRequest,
                Message: "A non-empty file upload is required.",
                TraceId: HttpContext.TraceIdentifier));
        }

        try
        {
            var result = await _propertyService.UploadAndAttachMediaAsync(id, file, folder, _cloudinaryService, ct);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ApiErrorResponse(
                StatusCode: StatusCodes.Status404NotFound,
                Message: $"Property with ID {id} was not found.",
                TraceId: HttpContext.TraceIdentifier));
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new ApiErrorResponse(
                StatusCode: StatusCodes.Status503ServiceUnavailable,
                Message: ex.Message,
                TraceId: HttpContext.TraceIdentifier));
        }
    }

    /// <summary>
    /// Removes a media asset association from a property.
    /// </summary>
    [HttpDelete("{id:int}/media/{mediaId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveMedia(int id, int mediaId, CancellationToken ct)
    {
        var removed = await _propertyService.RemoveMediaAsync(id, mediaId, ct);
        return removed ? NoContent() : NotFound(new ApiErrorResponse(
            StatusCode: StatusCodes.Status404NotFound,
            Message: $"Media with ID {mediaId} for Property {id} was not found.",
            TraceId: HttpContext.TraceIdentifier));
    }
}
