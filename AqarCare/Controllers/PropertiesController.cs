using AqarCare.DTOs;
using AqarCare.Services;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers;

/// <summary>
/// Public property exploration and catalog query endpoints.
/// </summary>
[ApiController]
[Route("api/properties")]
[Produces("application/json")]
public class PropertiesController : ControllerBase
{
    private readonly PropertyService _propertyService;

    public PropertiesController(PropertyService propertyService)
    {
        _propertyService = propertyService;
    }

    /// <summary>
    /// Retrieves a paginated list of published properties matching search and filter criteria.
    /// Results are cached using a composite versioned key.
    /// </summary>
    /// <param name="query">Filtering criteria including city, property type, price ranges, and bedrooms.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Filtered and paginated property items.</response>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<PropertyListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<PropertyListItemDto>>> GetList([FromQuery] PropertyQuery query, CancellationToken ct)
    {
        var result = await _propertyService.GetPublishedAsync(query, ct);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves complete details of a published property including floor matrix and media attachments.
    /// </summary>
    /// <param name="id">Property identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Property found and returned.</response>
    /// <response code="404">Property not found or is unpublished.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PropertyDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyDetailDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _propertyService.GetPublishedByIdAsync(id, ct);
        if (result is null)
        {
            return NotFound(new ApiErrorResponse(
                StatusCode: StatusCodes.Status404NotFound,
                Message: $"Published property with ID {id} was not found.",
                TraceId: HttpContext.TraceIdentifier));
        }

        return Ok(result);
    }
}
