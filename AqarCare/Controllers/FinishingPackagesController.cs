using AqarCare.DTOs;
using AqarCare.Services;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers;

[ApiController]
[Route("api/finishing-packages")]
public class FinishingPackagesController : ControllerBase
{
    private readonly FinishingPackageService _packageService;

    public FinishingPackagesController(FinishingPackageService packageService)
    {
        _packageService = packageService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FinishingPackageListItemDto>>> GetList(CancellationToken ct)
    {
        var result = await _packageService.GetActiveAsync(ct);
        return Ok(result);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<ActionResult<FinishingPackageDetailDto>> GetByIdOrSlug(string idOrSlug, CancellationToken ct)
    {
        var result = await _packageService.GetActiveByIdOrSlugAsync(idOrSlug, ct);
        return result is null ? NotFound() : Ok(result);
    }
}
