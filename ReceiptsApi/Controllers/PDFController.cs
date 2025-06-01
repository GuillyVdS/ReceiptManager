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

        // POST: api/pdf/uploadPdf
        [HttpPost("uploadPdf")]
        public IActionResult UploadPdf([FromForm] IFormFile pdf, [FromForm] string documentName)
        {
            if (pdf == null || pdf.Length == 0)
            {
                return BadRequest("No file was uploaded.");
            }

            try
            {
                // Use the provided documentName or fallback to the original file name
                var fileName = string.IsNullOrEmpty(documentName) ? pdf.FileName : documentName;
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                var extension = Path.GetExtension(fileName);
                var baseName = Path.GetFileNameWithoutExtension(fileName);
                fileName = $"{baseName}-{timestamp}{extension}";

                // Save the file
                var filePath = Path.Combine(_pdfFolderPath, fileName);
                if (!Directory.Exists(_pdfFolderPath))
                {
                    Directory.CreateDirectory(_pdfFolderPath);
                }

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    pdf.CopyTo(stream);
                }

                return Ok(new { message = "File uploaded successfully", fileName });
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

        // Private helper method to save the PDF
        private string SavePdfToFolder(IFormFile file)
        {
            var fileName = Path.GetFileName(file.FileName);
            var filePath = Path.Combine(_pdfFolderPath, fileName);

            // Ensure the directory exists
            if (!Directory.Exists(_pdfFolderPath))
            {
                Directory.CreateDirectory(_pdfFolderPath);
            }

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            return fileName;
        }
    }
}