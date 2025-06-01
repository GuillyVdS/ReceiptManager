using Microsoft.EntityFrameworkCore;
using ReceiptsApi.DTOs;
using ReceiptsApi.Helpers;

public class ReceiptService
{
    private readonly IReceiptRepository _repository;
    private readonly ILineItemRepository _lineItemRepository;
    private readonly ICategoryRepository _categoryRepository;

    public ReceiptService(
        IReceiptRepository repository,
        ILineItemRepository lineItemRepository,
        ICategoryRepository categoryRepository)
    {
        _repository = repository;
        _lineItemRepository = lineItemRepository;
        _categoryRepository = categoryRepository;
    }

    public Receipt CreateReceipt(List<ReceiptLineItemDTO> receiptItems)
    {
        if (receiptItems == null || !receiptItems.Any())
        {
            throw new ArgumentException("Receipt items cannot be null or empty.");
        }

        // Create a new receipt
        var receipt = new Receipt
        {
            Date = DateTime.UtcNow,
            ReceiptItems = receiptItems.Select(item => new ReceiptLineItem
            {
                LineItemId = item.ItemId,
                CategoryId = item.categoryId,
                Quantity = item.Quantity,
                Price = item.Price
            }).ToList()
        };

        // Save the receipt to the database
        _repository.AddReceipt(receipt);

        return receipt;
    }

    //currently this collects all receipt data. we don't really need to do this but it is useful for debugging
    //should probably get GetSimpleReceiptList & GetReceiptLines 
    public List<ReceiptDTO> GetReceiptList()
    {
        var receipts = _repository.GetReceiptList();
        return receipts.Select(receipt => new ReceiptDTO
        {
            ReceiptId = receipt.ReceiptId,
            Date = receipt.Date,
            Items = receipt.ReceiptItems.Select(ri => new ReceiptLineItemDTO
            {
                ItemId = ri.LineItemId,
                Description = ri.LineItem.Description,
                categoryId = ri.CategoryId,
                CategoryName = ri.Category.CategoryName,
                Quantity = ri.Quantity,
                Price = ri.Price
            }).ToList()
        }).ToList();
    }

    public ReceiptDTO GetReceiptById(int receiptId)
    {
        var receipt = _repository.GetReceiptById(receiptId);
        if (receipt == null)
            throw new KeyNotFoundException($"Receipt with ID {receiptId} not found.");

        return new ReceiptDTO
        {
            ReceiptId = receipt.ReceiptId,
            Date = receipt.Date,
            Items = receipt.ReceiptItems.Select(ri => new ReceiptLineItemDTO
            {
                ItemId = ri.LineItemId,
                Description = ri.LineItem.Description,
                categoryId = ri.CategoryId,
                CategoryName = ri.Category.CategoryName,
                Quantity = ri.Quantity,
                Price = ri.Price
            }).ToList()
        };
    }

    public List<ReceiptLineItem> AddItemsToDatabase(List<ReceiptLineItemDTO> lineItems)
    {
        var receiptLineItems = new List<ReceiptLineItem>();

        // Get descriptions from DTOs
        var lineItemDescriptions = lineItems.Select(item => item.Description?.ToLower()).ToList();

        // Fetch existing line items from the repository
        var existingLineItems = _lineItemRepository.GetLineItemsByDescriptions(lineItemDescriptions);

        // Prepare new line items to add
        var newLineItemsToAdd = new List<LineItem>();
        foreach (var item in lineItems)
        {
            item.Description = item.Description?.Trim();

            // Check if the line item already exists
            var itemRecord = existingLineItems
                .FirstOrDefault(li => li.Description != null &&
                                      item.Description != null &&
                                      li.Description.ToLower() == item.Description.ToLower());

            // If no record exists, create a new one
            if (itemRecord == null)
            {
                var newLineItem = new LineItem
                {
                    Description = item.Description,
                    CategoryId = 1 // Default category
                };

                newLineItemsToAdd.Add(newLineItem);
            }
        }

        // Add new line items to the database
        if (newLineItemsToAdd.Any())
        {
            _lineItemRepository.AddLineItems(newLineItemsToAdd);
            existingLineItems.AddRange(newLineItemsToAdd);
        }

        // Fetch categories from the category repository
        var categories = _categoryRepository.GetAllCategories();

        // Create ReceiptLineItems
        foreach (var item in lineItems)
        {
            var itemRecord = existingLineItems
                .FirstOrDefault(li => li.Description != null &&
                                      item.Description != null &&
                                      li.Description.ToLower() == item.Description.ToLower());

            if (itemRecord != null)
            {
                var category = categories.FirstOrDefault(c => c.CategoryId == itemRecord.CategoryId);
                if (category != null)
                {
                    item.CategoryName = category.CategoryName;
                }
            }

            var receiptLineItem = new ReceiptLineItem
            {
                LineItem = itemRecord,
                Quantity = item.Quantity,
                Price = item.Price
            };

            receiptLineItems.Add(receiptLineItem);
        }

        return receiptLineItems;
    }

    public List<Category> GetCategories()
    {
        return _categoryRepository.GetAllCategories();
    }

    public List<ReceiptLineItemDTO> ProcessPDF(string document, string pdfFolderPath)
    {
        PDFParser parser = new PDFParser();
        var lineItems = parser.ParsePdf(document, pdfFolderPath);

        if (lineItems == null || !lineItems.Any())
        {
            throw new InvalidOperationException("No line items were extracted from the PDF.");
        }

        var receiptLineItems = AddItemsToDatabase(lineItems);

        return receiptLineItems.Select(item => new ReceiptLineItemDTO
        {
            Description = item.LineItem?.Description ?? "Unknown Item",
            categoryId = item.Category?.CategoryId ?? 1,
            CategoryName = item.Category?.CategoryName ?? "Unknown",
            ItemId = item.LineItem.LineItemId,
            Quantity = item.Quantity,
            Price = item.Price
        }).ToList();
    }

    public List<(string originalName, string baseName)> GetPDFFiles(string pdfFolderPath)
    {
        if (!Directory.Exists(pdfFolderPath))
        {
            throw new DirectoryNotFoundException("PDF folder not found.");
        }

        return Directory.GetFiles(pdfFolderPath, "*.pdf")
            .Select(file =>
            {
                var ext = Path.GetExtension(file);
                var baseName = Path.GetFileNameWithoutExtension(file);
                var originalName = System.Text.RegularExpressions.Regex.Replace(baseName, @"-\d+$", "");
                return (originalName: originalName + ext, baseName: baseName + ext);
            })
            .ToList();
    }
}