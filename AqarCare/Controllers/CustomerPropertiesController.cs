using System.Security.Claims;
using AqarCare.DTOs;
using AqarCare.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers;

/// <summary>
/// Endpoints allowing authenticated customers to manage their submitted properties.
/// All customer-submitted properties require Administrator review and approval before becoming public.
/// </summary>
[ApiController]
[Route("api/properties/my")]
[Authorize]
[Produces("application/json")]
public class CustomerPropertiesController : ControllerBase
{
    private readonly PropertyService _propertyService;
    private readonly CloudinaryService _cloudinaryService;
    private readonly ILogger<CustomerPropertiesController> _logger;

    public CustomerPropertiesController(
        PropertyService propertyService,
        CloudinaryService cloudinaryService,
        ILogger<CustomerPropertiesController> logger)
    {
        _propertyService = propertyService;
        _cloudinaryService = cloudinaryService;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idClaim, out var userId) ? userId : 0;
    }

    /// <summary>
    /// Retrieves all properties submitted by the logged-in customer, along with approval/published status.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<PropertyListItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<PropertyListItemDto>>> GetMyProperties(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        if (userId <= 0) return Unauthorized();

        var properties = await _propertyService.GetCustomerPropertiesAsync(userId, ct);
        return Ok(properties);
    }

    /// <summary>
    /// Retrieves full detail of a property owned by the customer.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PropertyDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyDetailDto>> GetMyPropertyById(int id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        if (userId <= 0) return Unauthorized();

        var property = await _propertyService.GetByIdAsync(id, ct);
        if (property == null || property.AgentId != userId)
        {
            return NotFound(new ApiErrorResponse(
                StatusCode: StatusCodes.Status404NotFound,
                Message: "Property was not found in your account.",
                TraceId: HttpContext.TraceIdentifier));
        }

        return Ok(property);
    }

    /// <summary>
    /// Submits a new property by the authenticated customer.
    /// The property is stored as unapproved (IsPublished = false) until reviewed and approved by the Admin.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PropertyDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PropertyDetailDto>> CreateMyProperty([FromBody] CreatePropertyRequest request, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        if (userId <= 0) return Unauthorized();

        // Customer submitted properties must be under their account and unapproved by default
        var safeRequest = request with
        {
            AgentId = userId,
            IsPublished = false,
            IsFeatured = false
        };

        var result = await _propertyService.CreateAsync(safeRequest, ct);

        _logger.LogInformation("Customer {UserId} submitted new property {PropertyId} for admin review", userId, result.Id);
        return CreatedAtAction(nameof(GetMyPropertyById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Updates a property owned by the customer.
    /// Upon edit, the listing remains/resets to unapproved (IsPublished = false) for admin re-verification.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PropertyDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyDetailDto>> UpdateMyProperty(int id, [FromBody] UpdatePropertyRequest request, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        if (userId <= 0) return Unauthorized();

        var existing = await _propertyService.GetByIdAsync(id, ct);
        if (existing == null)
        {
            return NotFound(new ApiErrorResponse(
                StatusCode: StatusCodes.Status404NotFound,
                Message: $"Property with ID {id} was not found.",
                TraceId: HttpContext.TraceIdentifier));
        }

        if (existing.AgentId != userId)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiErrorResponse(
                StatusCode: StatusCodes.Status403Forbidden,
                Message: "Forbidden: You are not authorized to edit this property.",
                TraceId: HttpContext.TraceIdentifier));
        }

        var safeRequest = request with
        {
            AgentId = userId,
            IsPublished = false,
            IsFeatured = false
        };

        var result = await _propertyService.UpdateAsync(id, safeRequest, ct);
        _logger.LogInformation("Customer {UserId} updated property {PropertyId}", userId, id);
        return Ok(result);
    }

    /// <summary>
    /// Deletes a property owned by the customer.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMyProperty(int id, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        if (userId <= 0) return Unauthorized();

        var existing = await _propertyService.GetByIdAsync(id, ct);
        if (existing == null)
        {
            return NotFound(new ApiErrorResponse(
                StatusCode: StatusCodes.Status404NotFound,
                Message: $"Property with ID {id} was not found.",
                TraceId: HttpContext.TraceIdentifier));
        }

        if (existing.AgentId != userId)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiErrorResponse(
                StatusCode: StatusCodes.Status403Forbidden,
                Message: "Forbidden: You are not authorized to delete this property.",
                TraceId: HttpContext.TraceIdentifier));
        }

        await _propertyService.DeleteAsync(id, ct);
        _logger.LogInformation("Customer {UserId} removed property {PropertyId}", userId, id);
        return NoContent();
    }

    /// <summary>
    /// Uploads an image or media asset to Cloudinary and links it to the customer's property.
    /// </summary>
    [HttpPost("{id:int}/media/upload")]
    [RequestSizeLimit(100_000_000)]
    [ProducesResponseType(typeof(PropertyMediaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyMediaDto>> UploadMyPropertyMedia(int id, IFormFile file, [FromQuery] string? folder, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        if (userId <= 0) return Unauthorized();

        var existing = await _propertyService.GetByIdAsync(id, ct);
        if (existing == null || existing.AgentId != userId)
        {
            return NotFound(new ApiErrorResponse(
                StatusCode: StatusCodes.Status404NotFound,
                Message: "Property was not found in your account.",
                TraceId: HttpContext.TraceIdentifier));
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest(new ApiErrorResponse(
                StatusCode: StatusCodes.Status400BadRequest,
                Message: "A non-empty file upload is required.",
                TraceId: HttpContext.TraceIdentifier));
        }

        var result = await _propertyService.UploadAndAttachMediaAsync(id, file, folder, _cloudinaryService, ct);
        return Ok(result);
    }

    /// <summary>
    /// Removes a media asset from the customer's property.
    /// </summary>
    [HttpDelete("{id:int}/media/{mediaId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveMyPropertyMedia(int id, int mediaId, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        if (userId <= 0) return Unauthorized();

        var existing = await _propertyService.GetByIdAsync(id, ct);
        if (existing == null || existing.AgentId != userId)
        {
            return NotFound(new ApiErrorResponse(
                StatusCode: StatusCodes.Status404NotFound,
                Message: "Property was not found in your account.",
                TraceId: HttpContext.TraceIdentifier));
        }

        var removed = await _propertyService.RemoveMediaAsync(id, mediaId, ct);
        return removed ? NoContent() : NotFound(new ApiErrorResponse(
            StatusCode: StatusCodes.Status404NotFound,
            Message: $"Media with ID {mediaId} for Property {id} was not found.",
            TraceId: HttpContext.TraceIdentifier));
    }
}
