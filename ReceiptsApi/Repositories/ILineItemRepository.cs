public interface ILineItemRepository
{
    void AddLineItems(List<LineItem> lineItems);
    void UpdateLineItem(LineItem lineItem);
    LineItem? GetLineItemById(int lineItemId);
    List<LineItem> GetLineItemsByDescriptions(List<string> descriptions);
    List<LineItem> GetAllLineItems();

}