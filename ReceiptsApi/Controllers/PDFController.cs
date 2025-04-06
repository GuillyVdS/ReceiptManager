using Microsoft.AspNetCore.Mvc;
using ReceiptsApi.DTOs;
using ReceiptsApi.Helpers;

namespace ReceiptsApi.Controllers
{
    public class PDFController : BaseApiController
    {
        private readonly ReceiptService _receiptService;
        private readonly string _pdfFolderPath;

        public PDFController(ReceiptService receiptService)
        {
            var baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            var projectDirectory = Directory.GetParent(baseDirectory)?.Parent?.Parent?.Parent?.FullName;
            _pdfFolderPath = Path.Combine(projectDirectory, "ReceiptData", "PDFInput");
            _receiptService = receiptService;
        }

        // GET: api/pdf/categories
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

        // POST: api/pdf/processPDF
        [HttpPost("processPDF/{document}")]
        public IActionResult ProcessPDF(string document)
        {
            if (string.IsNullOrEmpty(document))
            {
                return BadRequest("PDF filename is required");
            }

            try
            {
                var lineItems = _receiptService.ProcessPDF(document, _pdfFolderPath);
                return Ok(lineItems);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/pdf/pdfList
        [HttpGet("pdfList")]
        public IActionResult GetPDFFiles()
        {
            try
            {
                var pdfFiles = _receiptService.GetPDFFiles(_pdfFolderPath);
                return Ok(new
                {
                    pdfFiles = pdfFiles.Select(file => new
                    {
                        OriginalName = file.originalName,
                        BaseName = file.baseName
                    })
                });
            }
            catch (DirectoryNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/pdf/createReceipt
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