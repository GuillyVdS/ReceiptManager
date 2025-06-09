public class LineItemRepository : ILineItemRepository
{
    private readonly ReceiptsContext _context;

    public LineItemRepository(ReceiptsContext context)
    {
        _context = context;
    }

    public bool AddLineItems(List<LineItem> lineItems)
    {
        try
        {
            _context.LineItems.AddRange(lineItems);
            _context.SaveChanges();
            return true;
        }
        catch
        {
            return false;
        }
    }

    public bool UpdateLineItem(LineItem lineItem)
    {
        try
        {
            _context.LineItems.Update(lineItem);
            _context.SaveChanges();
            return true;
        }
        catch
        {
            return false;
        }
    }

    public LineItem? GetLineItemById(int lineItemId)
    {
        return _context.LineItems.FirstOrDefault(li => li.LineItemId == lineItemId);
    }

    public List<LineItem> GetLineItemsByDescriptions(List<string> descriptions)
    {
        return _context.LineItems
            .Where(li => descriptions.Contains(li.Description.ToLower()))
            .ToList();
    }

    public List<LineItem> GetLineItemsByCategoryId(int categoryId)
    {
        return _context.LineItems
            .Where(li => li.CategoryId == categoryId)
            .ToList();
    }

    //returns all line items and the categories they belong to
    public List<LineItem> GetAllLineItems()
    {
        return _context.LineItems.ToList();
    }

    public bool ResetLineItemCategories()
    {
        try
        {
            var lineItems = _context.LineItems.ToList();
            foreach (var lineItem in lineItems)
            {
                lineItem.CategoryId = 1; // Resetting the category ID to "Unknown"
            }
            _context.SaveChanges();
            return true;
        }
        catch
        {
            return false;
        }
    }
}