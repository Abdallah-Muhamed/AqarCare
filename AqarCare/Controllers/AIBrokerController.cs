using AqarCare.DTOs;
using AqarCare.Services;
using Microsoft.AspNetCore.Mvc;

namespace AqarCare.Controllers;

[ApiController]
[Route("api/ai/broker")]
public class AIBrokerController : ControllerBase
{
    private readonly AIBrokerService _brokerService;

    public AIBrokerController(AIBrokerService brokerService)
    {
        _brokerService = brokerService;
    }

    [HttpPost]
    public async Task<ActionResult<AIBrokerResponse>> Chat([FromBody] AIBrokerRequest request, CancellationToken ct)
    {
        if (request?.Messages == null || !request.Messages.Any())
        {
            return BadRequest(new { message = "Messages array cannot be empty." });
        }

        var response = await _brokerService.GetBrokerReplyAsync(request, ct);
        return Ok(response);
    }
}
