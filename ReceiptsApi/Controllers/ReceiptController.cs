using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Utilities;
using ReceiptsApi.DTOs;
using ReceiptsApi.Helpers;

namespace ReceiptsApi.Controllers
{
    public class ReceiptController : BaseApiController
    {
        private readonly ReceiptService _receiptService;

        public ReceiptController(ReceiptService receiptService)
        {
            _receiptService = receiptService;
        }

        //GET api/receipt/list
        [HttpGet("list")]
        public IActionResult GetReceiptList()
        {
            try
            {
                var receipts = _receiptService.GetReceiptList();
                return Ok(new
                {
                    receipts = receipts.Select(receipts => new
                    {
                        receiptId = receipts.ReceiptId,
                        receiptName = receipts.Date.ToString("yyyy-MM-dd"),
                    })
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //GET api/receipt/receipt
        [HttpGet("{receiptId}")]
        public IActionResult GetReceipt(int receiptId)
        {
            try
            {
                var lineItems = _receiptService.GetReceiptById(receiptId);
                return Ok(lineItems);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/receipt/categories
        [HttpGet("categories")]
        public IActionResult GetCategories()
        {
            try
            {
                var categories = _receiptService.GetCategories();
                return Ok(categories.Select(category => new
                {
                    CategoryId = category.CategoryId,
                    CategoryName = category.CategoryName
                }));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/receipt/createReceipt
        [HttpPost("createReceipt")]
        public IActionResult CreateReceipt(List<ReceiptLineItemDTO> receiptItems)
        {
            if (receiptItems == null || !receiptItems.Any())
            {
                return BadRequest("No receipt data was provided.");
            }

            try
            {
                var createdReceipt = _receiptService.CreateReceipt(receiptItems);
                return Ok(new
                {
                    Message = "Receipt created successfully",
                    ReceiptId = createdReceipt.ReceiptId,
                    CreatedDate = createdReceipt.Date,
                    Items = createdReceipt.ReceiptItems.Select(item => new
                    {
                        ItemId = item.LineItemId,
                        CategoryId = item.CategoryId,
                        Quantity = item.Quantity,
                        Price = item.Price
                    })
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }
}