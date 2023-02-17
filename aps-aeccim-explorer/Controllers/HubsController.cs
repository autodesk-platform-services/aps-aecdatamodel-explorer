using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

[ApiController]
[Route("api/[controller]")]
public class HubsController : ControllerBase
{
	private readonly ILogger<HubsController> _logger;
	private readonly ForgeService _forgeService;

	public HubsController(ILogger<HubsController> logger, ForgeService forgeService)
	{
		_logger = logger;
		_forgeService = forgeService;
	}

	[HttpGet("{project}/contents/{item}/versions")]
	public async Task<ActionResult<string>> ListVersions(string project, string item)
	{
		var tokens = await AuthController.PrepareTokens(Request, Response, _forgeService);
		if (tokens == null)
		{
			return Unauthorized();
		}
		var versions = await _forgeService.GetVersions(project, item, tokens);
		return JsonConvert.SerializeObject(versions);
	}
}