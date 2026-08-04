using AqarCare.DTOs;
using AqarCare.Filters;
using AqarCare.Services;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers.Admin;

[ApiController]
[Route("api/admin/finishing-packages")]
[AdminApiKey]
public class AdminFinishingPackagesController : ControllerBase
{
    private readonly FinishingPackageService _packageService;

    public AdminFinishingPackagesController(FinishingPackageService packageService)
    {
        _packageService = packageService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FinishingPackageListItemDto>>> GetList(CancellationToken ct)
    {
        var result = await _packageService.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FinishingPackageDetailDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _packageService.GetByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<FinishingPackageDetailDto>> Create([FromBody] CreateFinishingPackageRequest request, CancellationToken ct)
    {
        var result = await _packageService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<FinishingPackageDetailDto>> Update(int id, [FromBody] UpdateFinishingPackageRequest request, CancellationToken ct)
    {
        var result = await _packageService.UpdateAsync(id, request, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var deleted = await _packageService.DeleteAsync(id, ct);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id:int}/media")]
    public async Task<ActionResult<PropertyMediaDto>> AddMedia(int id, [FromBody] AddPackageMediaRequest request, CancellationToken ct)
    {
        var result = await _packageService.AddMediaAsync(id, request, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}/media/{mediaId:int}")]
    public async Task<IActionResult> RemoveMedia(int id, int mediaId, CancellationToken ct)
    {
        var removed = await _packageService.RemoveMediaAsync(id, mediaId, ct);
        return removed ? NoContent() : NotFound();
    }
}
