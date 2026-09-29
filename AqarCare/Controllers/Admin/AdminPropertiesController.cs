using AqarCare.DTOs;
using AqarCare.Filters;
using AqarCare.Services;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers.Admin;

[ApiController]
[Route("api/admin/properties")]
[AdminApiKey]
public class AdminPropertiesController : ControllerBase
{
    private readonly PropertyService _propertyService;
    private readonly CloudinaryService _cloudinaryService;

    public AdminPropertiesController(PropertyService propertyService, CloudinaryService cloudinaryService)
    {
        _propertyService = propertyService;
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<PropertyListItemDto>>> GetList([FromQuery] PropertyQuery query, CancellationToken ct)
    {
        var result = await _propertyService.GetAllAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PropertyDetailDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _propertyService.GetByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PropertyDetailDto>> Create([FromBody] CreatePropertyRequest request, CancellationToken ct)
    {
        var result = await _propertyService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PropertyDetailDto>> Update(int id, [FromBody] UpdatePropertyRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _propertyService.UpdateAsync(id, request, ct);
            return result is null ? NotFound() : Ok(result);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException)
        {
            return Conflict(new { error = "Conflict detected: The property record was modified by another administrator. Please reload the latest data." });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var deleted = await _propertyService.DeleteAsync(id, ct);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id:int}/media")]
    public async Task<ActionResult<PropertyMediaDto>> AddMedia(int id, [FromBody] AddPropertyMediaRequest request, CancellationToken ct)
    {
        var result = await _propertyService.AddMediaAsync(id, request, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:int}/media/upload")]
    [RequestSizeLimit(100_000_000)]
    public async Task<ActionResult<PropertyMediaDto>> UploadMedia(int id, IFormFile file, [FromQuery] string? folder, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "File is required." });

        try
        {
            var result = await _propertyService.UploadAndAttachMediaAsync(id, file, folder, _cloudinaryService, ct);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Property {id} not found." });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = ex.Message });
        }
    }

    [HttpDelete("{id:int}/media/{mediaId:int}")]
    public async Task<IActionResult> RemoveMedia(int id, int mediaId, CancellationToken ct)
    {
        var removed = await _propertyService.RemoveMediaAsync(id, mediaId, ct);
        return removed ? NoContent() : NotFound();
    }
}
