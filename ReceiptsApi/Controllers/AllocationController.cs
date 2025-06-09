using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Utilities;
using ReceiptsApi.DTOs;
using ReceiptsApi.Helpers;

namespace ReceiptsApi.Controllers
{
    public class AllocationController : BaseApiController
    {
        private readonly AllocationService _allocationService;

        public AllocationController(AllocationService allocationService)
        {
            _allocationService = allocationService;
        }

        // //GET api/allocations/list
        [HttpGet("list")]
        public IActionResult GetAllocations()
        {
            try
            {
                var lineItems = _allocationService.GetAllocations();
                return Ok(lineItems);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("save")]
        public IActionResult SaveAllocations([FromBody] object allocations)
        {
            // TODO: Implement saving logic
            // You can replace 'object' with a specific DTO or model as needed
            try
            {
                // _allocationService.SaveAllocations(allocations);
                return Ok(new { message = "Allocations saved (stub)." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("reset")]
        public IActionResult ResetAllocations()
        {
            try
            {
                _allocationService.ResetAllocations();
                return Ok(new { message = "Allocations saved (stub)." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


    }
}