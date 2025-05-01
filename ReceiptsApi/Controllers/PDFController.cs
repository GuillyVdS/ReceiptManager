using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReceiptsApi.DTOs;
using ReceiptsApi.Helpers;
using ReceiptsApi.Services;

namespace ReceiptsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PDFController : ControllerBase
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
            var categories = _receiptService.GetCategories();

            var categoryObjects = categories.Select(category => new
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName
            }).ToList();

            return Ok(categoryObjects);
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
                //extract the line items from the PDF
                PDFParser parser = new PDFParser();
                var lineItems = parser.ParsePdf(document, _pdfFolderPath);

                if (lineItems == null || !lineItems.Any())
                {
                    return BadRequest("No line items were extracted from the PDF.");
                }

                var itemsToAssign = new List<ReceiptLineItem>();
                var returnItems = new List<ReceiptLineItemDTO>();

                itemsToAssign = _receiptService.addItemsToDatabase(lineItems);

                if (itemsToAssign == null || !itemsToAssign.Any())
                {
                    return BadRequest("No items were assigned to the database.");
                }

                if (itemsToAssign?.Count > 0)
                {
                    returnItems = itemsToAssign.Select(item => new ReceiptLineItemDTO
                    {
                        Description = item.LineItem?.Description ?? "Unknown Item",
                        categoryId = item.Category?.CategoryId ?? 1,
                        CategoryName = item.Category?.CategoryName ?? "Unknown",
                        ItemId = item.LineItem.LineItemId,
                        Quantity = item.Quantity,
                        Price = item.Price
                    }).ToList();
                }

                return Ok(returnItems);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"DbUpdateException: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, $"Database update error: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/pdf/pdfList
        [HttpGet("pdfList")]
        public IActionResult GetPDFFiles()
        {
            if (!Directory.Exists(_pdfFolderPath))
            {
                return NotFound("Folder not found");
            }

            var pdfFiles = Directory.GetFiles(_pdfFolderPath, "*.pdf")
                                    .Select(Path.GetFileName)
                                    .Select(file =>
                                    {
                                        var ext = Path.GetExtension(file);
                                        var baseName = Path.GetFileNameWithoutExtension(file);
                                        var originalName = System.Text.RegularExpressions.Regex.Replace(baseName, @"-\d+$", "");
                                        return new
                                        {
                                            originalName = originalName + ext,
                                            baseName = baseName + ext
                                        };
                                    })
                                    .ToList();

            var response = new
            {
                pdfFiles = pdfFiles
            };

            return Ok(response);
        }
    }
}