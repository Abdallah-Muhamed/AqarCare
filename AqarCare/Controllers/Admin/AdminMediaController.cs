using AqarCare.Filters;
using AqarCare.Services;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers.Admin;

[ApiController]
[Route("api/admin/media")]
[AdminApiKey]
public class AdminMediaController : ControllerBase
{
    private readonly CloudinaryService _cloudinaryService;

    public AdminMediaController(CloudinaryService cloudinaryService)
    {
        _cloudinaryService = cloudinaryService;
    }

    [HttpPost("upload")]
    [RequestSizeLimit(100_000_000)]
    public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string? folder, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "File is required." });

        try
        {
            var result = await _cloudinaryService.UploadAsync(file, folder, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = ex.Message });
        }
    }

    [HttpDelete("{*publicId}")]
    public async Task<IActionResult> Delete(string publicId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(publicId))
            return BadRequest(new { error = "PublicId is required." });

        try
        {
            await _cloudinaryService.DeleteAsync(publicId, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = ex.Message });
        }
    }
}
