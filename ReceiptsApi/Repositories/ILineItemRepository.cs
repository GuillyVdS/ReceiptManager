using System.ComponentModel;

public interface ILineItemRepository
{
    Boolean AddLineItems(List<LineItem> lineItems);
    Boolean UpdateLineItem(LineItem lineItem);
    LineItem? GetLineItemById(int lineItemId);
    List<LineItem> GetLineItemsByDescriptions(List<string> descriptions);
    List<LineItem> GetAllLineItems();
    Boolean ResetLineItemCategories();

}