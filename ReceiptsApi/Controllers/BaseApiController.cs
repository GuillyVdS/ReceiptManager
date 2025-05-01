using Microsoft.AspNetCore.Mvc;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

namespace ReceiptsApi.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    
    public class BaseApiController : ControllerBase
    {
        
    }
}