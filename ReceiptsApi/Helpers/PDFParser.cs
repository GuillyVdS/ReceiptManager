using System.Text.RegularExpressions;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using ReceiptsApi.DTOs;

namespace ReceiptsApi.Helpers
{
    public class PDFParser
    {
        public PDFParser()
        {
        }

        public List<ReceiptLineItemDTO> ParsePdf(string pdfFileName, string folderPath)
        {
            var pdfFilePath = Path.Combine(folderPath, pdfFileName);

            if (!File.Exists(pdfFilePath))
            {
                throw new FileNotFoundException("PDF file not found", pdfFileName);
            }

            var lineItems = new List<ReceiptLineItemDTO>();

            using (var pdfDocument = new PdfDocument(new PdfReader(pdfFilePath)))
            {
                var docText = string.Empty;
                for (int i = 1; i <= pdfDocument.GetNumberOfPages(); i++)
                {
                    var page = pdfDocument.GetPage(i);
                    var strategy = new SimpleTextExtractionStrategy();
                    var pageText = PdfTextExtractor.GetTextFromPage(page, strategy);
                    docText += pageText + "\n";
                }

                var sanitizedText = SanitizeExtractedPDF(docText);
                var items = GetLineItems(sanitizedText);
                lineItems.AddRange(items);
            }

            return lineItems;
        }

        private string SanitizeExtractedPDF(string text)
        {
            var lines = text.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries).Select(line => line.Trim()).ToList();

            bool foundItemList = false;
            var cleanedLines = new List<string>();
            var mergedLine = string.Empty;

            var categoryWords = new HashSet<string> { "Fridge", "Freezer", "Cupboard" };
            int itemCount = 0;

            foreach (var line in lines)
            {
                if (!foundItemList)
                {
                    if (line.Contains("The rest of your items"))
                    {
                        Console.WriteLine("Found item list");
                        foundItemList = true;
                        continue;
                    }
                    else
                    {
                        continue;
                    }
                }

                if (Regex.IsMatch(line, @"Items marked with an .* include VAT at (20|5)%"))
                {
                    Console.WriteLine("Found end of item list");
                    break;
                }

                if (Regex.IsMatch(line, @"Was £\d+\.\d{2}, now £\d+\.\d{2}") ||
                    Regex.IsMatch(line, @"^\d{2}/\d{2}/\d{4}, \d{2}:\d{2}") ||
                    Regex.IsMatch(line, @"https?://mail\.google\.com") ||
                    line.Contains("Receipt for") ||
                    string.IsNullOrEmpty(line))
                {
                    continue;
                }

                var sanitizedLine = line.Replace("†", "").Trim();

                if (categoryWords.Contains(sanitizedLine))
                {
                    continue;
                }

                if (Regex.IsMatch(sanitizedLine, @"£\d+\.\d{2}"))
                {
                    // This line contains a price → it's a complete product line
                    if (!string.IsNullOrEmpty(mergedLine))
                    {
                        sanitizedLine = (mergedLine + ' ' + sanitizedLine).Replace(@"\s*(£\d+\.\d{2})", "$1"); // Remove spaces before prices
                        mergedLine = string.Empty; // Reset for next item
                    }

                    var match = Regex.Match(sanitizedLine, @"(\d+\s+.+?\s+£\d+\.\d{2}\s+£\d+\.\d{2})$");
                    if (match.Success)
                    {
                        cleanedLines.Add(match.Value.Trim());
                        itemCount++; // Increment valid item count
                    }
                }
                else
                {
                    // This line does NOT contain a price → it's part of the description
                    mergedLine += (!string.IsNullOrEmpty(mergedLine) ? " " : "") + sanitizedLine.Trim(); // Trim to prevent space buildup
                }
            }

            return string.Join("\n", cleanedLines);
        }

        private List<ReceiptLineItemDTO> GetLineItems(string text)
        {
            var lines = text.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None)
                            .Select(line => line.Trim())
                            .Where(line => !string.IsNullOrEmpty(line))
                            .ToList();
            var items = new List<ReceiptLineItemDTO>();


            var regex = new Regex(@"^(\d+)\s+(.+?)\s*£\d+\.\d{2}\s*£(\d+\.\d{2})$");


            foreach (var line in lines)
            {
                var match = regex.Match(line);

                if (match.Success)
                {
                    var quantityString = match.Groups[1].Value.Trim();
                    var description = match.Groups[2].Value.Trim();
                    var priceString = match.Groups[3].Value.Trim();

                    if (decimal.TryParse(priceString, out var price) && int.TryParse(quantityString, out var quantity))
                    {
                        items.Add(new ReceiptLineItemDTO
                        {
                            Quantity = quantity,
                            Description = description,
                            Price = price
                        });
                    }
                }
            }

            return items;
        }
    }
}