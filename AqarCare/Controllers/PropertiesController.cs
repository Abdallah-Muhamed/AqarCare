using AqarCare.DTOs;
using AqarCare.Services;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers;

[ApiController]
[Route("api/properties")]
public class PropertiesController : ControllerBase
{
    private readonly PropertyService _propertyService;

    public PropertiesController(PropertyService propertyService)
    {
        _propertyService = propertyService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<PropertyListItemDto>>> GetList([FromQuery] PropertyQuery query, CancellationToken ct)
    {
        var result = await _propertyService.GetPublishedAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PropertyDetailDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _propertyService.GetPublishedByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }
}
