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

        // Add new line items and update categories as needed
        var (updatedLineItems, failedUpdates) = AddItemsToDatabase(receiptItems);
        if (failedUpdates.Any())
        {
            //need to add logging of failed updates
        }

        // Create a new receipt
        var receipt = new Receipt
        {
            Date = DateTime.UtcNow,
            ReceiptItems = receiptItems.Select(item =>
            {
                var itemRecord = updatedLineItems
                    .FirstOrDefault(li => li.Description.ToLower() == item.Description.Trim().ToLower());

                return new ReceiptLineItem
                {
                    LineItemId = itemRecord.LineItemId,
                    CategoryId = item.categoryId,
                    Quantity = item.Quantity,
                    Price = item.Price
                };
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

    public (List<LineItem> updatedLineItems, List<LineItem> failedUpdates) AddItemsToDatabase(List<ReceiptLineItemDTO> lineItems)
    {
        var lineItemDescriptions = lineItems.Select(item => item.Description?.Trim().ToLower()).ToList();
        var existingLineItems = _lineItemRepository.GetLineItemsByDescriptions(lineItemDescriptions);
        var newLineItemsToAdd = new List<LineItem>();
        var failedUpdates = new List<LineItem>();

        foreach (var item in lineItems)
        {
            var desc = item.Description?.Trim().ToLower();
            var itemRecord = existingLineItems.FirstOrDefault(li => li.Description.ToLower() == desc);

            if (itemRecord == null)
            {
                var newLineItem = new LineItem
                {
                    Description = item.Description,
                    CategoryId = item.categoryId
                };
                newLineItemsToAdd.Add(newLineItem);
            }
            else
            {
                // Only update the global LineItem category if setDefaultCategory is true
                if (item.setDefaultCategory && itemRecord.CategoryId != item.categoryId)
                {
                    itemRecord.CategoryId = item.categoryId;
                    bool updateSucceeded = _lineItemRepository.UpdateLineItem(itemRecord);
                    if (!updateSucceeded)
                    {
                        failedUpdates.Add(itemRecord);
                    }
                }
            }
        }

        if (newLineItemsToAdd.Any())
        {
            bool addSucceeded = _lineItemRepository.AddLineItems(newLineItemsToAdd);
            if (!addSucceeded)
            {
                failedUpdates.AddRange(newLineItemsToAdd);
            }
            else
            {
                existingLineItems.AddRange(newLineItemsToAdd);
            }
        }

        return (existingLineItems, failedUpdates);
    }

    public List<Category> GetCategories()
    {
        return _categoryRepository.GetAllCategories();
    }

    public List<ReceiptLineItemDTO> ProcessPDF(string document, string pdfFolderPath)
    {
        PDFParser parser = new PDFParser();
        var parsedLineItems = parser.ParsePdf(document, pdfFolderPath);

        if (parsedLineItems == null || !parsedLineItems.Any())
        {
            throw new InvalidOperationException("No line items were extracted from the PDF.");
        }
        //originally saved any new items directly to the db, however this was premature as we need to establish categorie first which takes place client-side
        //furthermore, there is no guarantee the client-side will save the receipt, as this process can be cancelled after the server returns the processed line items.
        //var receiptLineItems = AddItemsToDatabase(lineItems);

        // Get all descriptions from parsed items
        var descriptions = parsedLineItems
            .Select(item => item.Description?.Trim().ToLower())
            .Where(desc => !string.IsNullOrEmpty(desc))
            .ToList();

        // Fetch existing line items from the DB
        var existingLineItems = _lineItemRepository.GetLineItemsByDescriptions(descriptions);

        // Fetch all categories
        var categories = _categoryRepository.GetAllCategories();

        // Map parsed items to DTOs, using DB info if available
        var result = parsedLineItems.Select((parsed, idx) =>
        {
            var desc = parsed.Description?.Trim().ToLower();
            var existing = existingLineItems.FirstOrDefault(li => li.Description.ToLower() == desc);

            int itemId = existing?.LineItemId ?? -(idx + 1); // Assign negative unique ID for new items
            int categoryId = existing?.CategoryId ?? 1;
            string categoryName = categories.FirstOrDefault(c => c.CategoryId == categoryId)?.CategoryName ?? "Unknown";

            return new ReceiptLineItemDTO
            {
                ItemId = itemId,
                Description = parsed.Description ?? "Unknown Item",
                categoryId = categoryId,
                CategoryName = categoryName,
                Quantity = parsed.Quantity,
                Price = parsed.Price
            };
        }).ToList();

        return result;
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