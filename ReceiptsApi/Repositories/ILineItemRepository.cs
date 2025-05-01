public interface ILineItemRepository
{
    List<LineItem> GetLineItemsByDescriptions(List<string> descriptions);
    void AddLineItems(List<LineItem> lineItems);
    LineItem GetLineItemById(int lineItemId);
}