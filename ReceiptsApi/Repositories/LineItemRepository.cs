public class LineItemRepository : ILineItemRepository
{
    private readonly ReceiptsContext _context;

    public LineItemRepository(ReceiptsContext context)
    {
        _context = context;
    }

    public List<LineItem> GetLineItemsByDescriptions(List<string> descriptions)
    {
        return _context.LineItems
            .Where(li => descriptions.Contains(li.Description.ToLower()))
            .ToList();
    }

    public void AddLineItems(List<LineItem> lineItems)
    {
        _context.LineItems.AddRange(lineItems);
        _context.SaveChanges();
    }

    public LineItem GetLineItemById(int lineItemId)
    {
        return _context.LineItems.FirstOrDefault(li => li.LineItemId == lineItemId);
    }
}