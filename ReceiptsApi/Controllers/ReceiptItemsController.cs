using Microsoft.EntityFrameworkCore;
using ReceiptsApi.DTOs;

namespace ReceiptsApi.Services
{
    public class ReceiptService
    {
        private readonly ReceiptsContext _context;

        public ReceiptService(ReceiptsContext context)
        {
            _context = context;
        }

        // Function addItemsToDatabase takes in lineItems (ReceiptLineItemDTO), goes over each item, checks if a matching description exists in the db
        // If it does not, it adds one to the LineItem table. If a match does exist, the categoryId should be extracted from that match and returned as well.
        // Function should return a list of ReceiptLineItems.
        public List<ReceiptLineItem> addItemsToDatabase(List<ReceiptLineItemDTO> lineItems)
        {
            var receiptLineItems = new List<ReceiptLineItem>();


            var lineItemDescriptions = lineItems.Select(item => item.Description?.ToLower()).ToList();
            var newLineItemsToAdd = new List<LineItem>();


            // We grab a list of itemDescriptions from the DB
            var existingLineItems = _context.LineItems
                .Where(li => lineItemDescriptions.Contains(li.Description.ToLower()))
                .ToList();

            foreach (var item in lineItems)
            {
                item.Description = item.Description?.Trim();

                if (_context == null)
                {
                    throw new InvalidOperationException("ReceiptsContext is not initialized.");
                }

                // Check if description matches any item in the LineItem table
                var itemRecord = existingLineItems
                    .FirstOrDefault(li => li.Description != null &&
                    item.Description != null &&
                    li.Description.ToLower() == item.Description.ToLower());

                // If no record exists, create one
                if (itemRecord == null)
                {
                    var newLineItem = new LineItem
                    {
                        Description = item.Description,
                        CategoryId = 1 // Set to default Unknown category
                    };

                    newLineItemsToAdd.Add(newLineItem);
                    //itemRecord = newLineItem;
                }
            }

            // Save new lineItems to database
            if (newLineItemsToAdd.Any())
            {
                _context.LineItems.AddRange(newLineItemsToAdd);

                _context.SaveChanges();

                existingLineItems.AddRange(newLineItemsToAdd);
            }

            // We fetch a list of categories from the DB
            var categories = _context.Categories.ToList();

            // Go through each item again to create ReceiptLineItemsDTO
            foreach (var item in lineItems)
            {
                item.Description = item.Description?.Trim();

                if (_context == null)
                {
                    throw new InvalidOperationException("ReceiptsContext is not initialized.");
                }

                var itemRecord = existingLineItems //_context.LineItems
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
            return _context.Categories.ToList();
        }
    }
}