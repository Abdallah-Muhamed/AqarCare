using AqarCare.DTOs;
using AqarCare.Filters;
using AqarCare.Services;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers.Admin;

[ApiController]
[Route("api/admin/maps")]
[AdminApiKey]
public class AdminMapsController : ControllerBase
{
    private readonly MapService _mapService;
    private readonly MansheyatElBakryOsmImportService _osmImportService;

    public AdminMapsController(MapService mapService, MansheyatElBakryOsmImportService osmImportService)
    {
        _mapService = mapService;
        _osmImportService = osmImportService;
    }

    [HttpPost("imports/mansheyat-el-bakry/roads")]
    public async Task<ActionResult<OsmRoadImportResult>> ImportMansheyatElBakryRoads(CancellationToken ct) =>
        Ok(await _osmImportService.ImportAsync(ct));

    [HttpGet("cities")]
    public async Task<ActionResult<IReadOnlyList<MapCityListItemDto>>> GetCities(CancellationToken ct) =>
        Ok(await _mapService.GetAllCitiesAsync(ct));

    [HttpPost("cities")]
    public async Task<ActionResult<MapCityListItemDto>> CreateCity(CreateMapCityRequest request, CancellationToken ct)
    {
        var result = await _mapService.CreateCityAsync(request, ct);
        return CreatedAtAction(nameof(GetCities), new { id = result.Id }, result);
    }

    [HttpPut("cities/{id:int}")]
    public async Task<ActionResult<MapCityListItemDto>> UpdateCity(int id, UpdateMapCityRequest request, CancellationToken ct)
    {
        var result = await _mapService.UpdateCityAsync(id, request, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("cities/{id:int}")]
    public async Task<IActionResult> DeleteCity(int id, CancellationToken ct) =>
        await _mapService.DeleteCityAsync(id, ct) ? NoContent() : NotFound();

    [HttpGet("cities/{cityId:int}/streets")]
    public async Task<ActionResult<IReadOnlyList<MapStreetDto>>> GetStreets(int cityId, CancellationToken ct)
    {
        var result = await _mapService.GetStreetsAsync(cityId, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("cities/{cityId:int}/streets")]
    public async Task<ActionResult<MapStreetDto>> CreateStreet(int cityId, CreateMapStreetRequest request, CancellationToken ct)
    {
        var result = await _mapService.CreateStreetAsync(cityId, request, ct);
        return result is null ? NotFound() : CreatedAtAction(nameof(GetStreets), new { cityId }, result);
    }

    [HttpPut("streets/{id:int}")]
    public async Task<ActionResult<MapStreetDto>> UpdateStreet(int id, UpdateMapStreetRequest request, CancellationToken ct)
    {
        var result = await _mapService.UpdateStreetAsync(id, request, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("streets/{id:int}")]
    public async Task<IActionResult> DeleteStreet(int id, CancellationToken ct)
    {
        try
        {
            return await _mapService.DeleteStreetAsync(id, ct) ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPut("properties/{propertyId:int}/location")]
    public async Task<IActionResult> SetPropertyLocation(int propertyId, SetPropertyMapLocationRequest request, CancellationToken ct) =>
        await _mapService.SetPropertyLocationAsync(propertyId, request, ct) ? NoContent() : NotFound();

    [HttpDelete("properties/{propertyId:int}/location")]
    public async Task<IActionResult> RemovePropertyLocation(int propertyId, CancellationToken ct) =>
        await _mapService.RemovePropertyLocationAsync(propertyId, ct) ? NoContent() : NotFound();
}
