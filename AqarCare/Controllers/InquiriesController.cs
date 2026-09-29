using System.Security.Claims;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using AqarCare.Filters;
using AqarCare.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers;

/// <summary>
/// Manages property inquiries, customer lead workflows, and agent follow-ups.
/// </summary>
[ApiController]
[Route("api")]
[Produces("application/json")]
public class InquiriesController : ControllerBase
{
    private readonly IInquiryService _inquiryService;
    private readonly ILogger<InquiriesController> _logger;

    public InquiriesController(IInquiryService inquiryService, ILogger<InquiriesController> logger)
    {
        _inquiryService = inquiryService;
        _logger = logger;
    }

    /// <summary>
    /// Submits a new customer inquiry or contact request for a specific property listing.
    /// Accessible by public visitors and logged-in customers.
    /// </summary>
    /// <param name="propertyId">Unique identifier of the property.</param>
    /// <param name="request">Customer contact information and message.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="201">Inquiry created successfully.</response>
    /// <response code="400">Validation failure or property not found.</response>
    [HttpPost("properties/{propertyId:int}/inquiries")]
    [ProducesResponseType(typeof(PropertyInquiryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PropertyInquiryDto>> CreateInquiry(
        int propertyId,
        [FromBody] CreateInquiryRequest request,
        CancellationToken ct)
    {
        int? customerId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(idClaim, out var parsedId) && parsedId > 0)
            {
                customerId = parsedId;
            }
        }

        var (success, error, result) = await _inquiryService.CreateInquiryAsync(propertyId, request, customerId, ct);

        if (!success || result == null)
        {
            return BadRequest(new ApiErrorResponse(
                StatusCode: StatusCodes.Status400BadRequest,
                Message: error ?? "Unable to submit inquiry.",
                TraceId: HttpContext.TraceIdentifier));
        }

        return CreatedAtAction(nameof(GetMyInquiries), new { id = result.Id }, result);
    }

    /// <summary>
    /// Retrieves all inquiries submitted by the authenticated customer.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Returns list of inquiries submitted by this customer.</response>
    /// <response code="401">User is not authenticated.</response>
    [Authorize]
    [HttpGet("inquiries/my")]
    [ProducesResponseType(typeof(IReadOnlyList<PropertyInquiryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<PropertyInquiryDto>>> GetMyInquiries(CancellationToken ct)
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idClaim, out var customerId) || customerId <= 0)
        {
            return Unauthorized(new ApiErrorResponse(
                StatusCode: StatusCodes.Status401Unauthorized,
                Message: "Invalid customer identity claims.",
                TraceId: HttpContext.TraceIdentifier));
        }

        var items = await _inquiryService.GetCustomerInquiriesAsync(customerId, ct);
        return Ok(items);
    }

    /// <summary>
    /// Retrieves inquiries for review. Admins can view all inquiries; Agents see inquiries for their listings.
    /// </summary>
    /// <param name="status">Optional filter by status (Pending, Contacted, Closed).</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of accessible inquiries.</response>
    /// <response code="403">Caller does not have Admin or Agent role.</response>
    [AdminApiKey]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Agent}")]
    [HttpGet("inquiries")]
    [ProducesResponseType(typeof(IReadOnlyList<PropertyInquiryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<PropertyInquiryDto>>> GetInquiries([FromQuery] string? status, CancellationToken ct)
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var isAdmin = string.Equals(role, UserRoles.Admin, StringComparison.OrdinalIgnoreCase);

        if (isAdmin)
        {
            var inquiries = await _inquiryService.GetAllInquiriesAsync(status, ct);
            return Ok(inquiries);
        }

        // For Agent: retrieve inquiries for their properties
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(idClaim, out var agentId))
        {
            var inquiries = await _inquiryService.GetAgentInquiriesAsync(agentId, ct);
            if (!string.IsNullOrWhiteSpace(status))
            {
                inquiries = inquiries.Where(i => string.Equals(i.Status, status, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            return Ok(inquiries);
        }

        return Ok(Array.Empty<PropertyInquiryDto>());
    }

    /// <summary>
    /// Updates the workflow status of an inquiry (Pending, Contacted, Closed).
    /// </summary>
    /// <param name="id">Inquiry ID.</param>
    /// <param name="request">New status value.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Inquiry status updated successfully.</response>
    /// <response code="400">Invalid status or validation error.</response>
    /// <response code="403">Insufficient permissions to manage this inquiry.</response>
    /// <response code="404">Inquiry not found.</response>
    [AdminApiKey]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Agent}")]
    [HttpPatch("inquiries/{id:int}/status")]
    [ProducesResponseType(typeof(PropertyInquiryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyInquiryDto>> UpdateInquiryStatus(
        int id,
        [FromBody] UpdateInquiryStatusRequest request,
        CancellationToken ct)
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(idClaim, out var userId);

        var (success, error, result) = await _inquiryService.UpdateStatusAsync(id, request.Status, userId, role, ct);

        if (!success || result == null)
        {
            if (error?.Contains("permission", StringComparison.OrdinalIgnoreCase) == true)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new ApiErrorResponse(
                    StatusCode: StatusCodes.Status403Forbidden,
                    Message: error,
                    TraceId: HttpContext.TraceIdentifier));
            }

            if (error?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
            {
                return NotFound(new ApiErrorResponse(
                    StatusCode: StatusCodes.Status404NotFound,
                    Message: error,
                    TraceId: HttpContext.TraceIdentifier));
            }

            return BadRequest(new ApiErrorResponse(
                StatusCode: StatusCodes.Status400BadRequest,
                Message: error ?? "Failed to update inquiry status.",
                TraceId: HttpContext.TraceIdentifier));
        }

        return Ok(result);
    }
}
