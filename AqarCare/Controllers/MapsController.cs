using AqarCare.DTOs;
using AqarCare.Services;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers;

[ApiController]
[Route("api/maps")]
public class MapsController : ControllerBase
{
    private readonly MapService _mapService;

    public MapsController(MapService mapService) => _mapService = mapService;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MapCityListItemDto>>> GetCities(CancellationToken ct) =>
        Ok(await _mapService.GetActiveCitiesAsync(ct));

    [HttpGet("{citySlug}")]
    public async Task<ActionResult<CityMapDto>> GetCityMap(string citySlug, [FromQuery] PropertyQuery query, CancellationToken ct)
    {
        var result = await _mapService.GetPublicMapAsync(citySlug, query, ct);
        return result is null ? NotFound() : Ok(result);
    }
}
