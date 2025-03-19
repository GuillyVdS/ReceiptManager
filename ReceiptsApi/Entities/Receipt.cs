using System.ComponentModel.DataAnnotations;

public class Receipt
{
    [Key]
    public int ReceiptId { get; set; }
    public DateTime Date { get; set; }
    public List<ReceiptLineItem> ReceiptItems { get; set; } = new();

    public void AddItem(LineItem lineItem, int quantity)
    {
        var existingItem = ReceiptItems.FirstOrDefault(item => item.LineItem.LineItemId == lineItem.LineItemId);

        if (existingItem == null)
        {
            ReceiptItems.Add(new ReceiptLineItem { LineItem = lineItem, Quantity = quantity });
        }
        else
        {
            existingItem.Quantity += quantity;
        }
    }

    public void RemoveItem(int lineItemId, int quantity)
    {
        var item = ReceiptItems.FirstOrDefault(item => item.LineItem.LineItemId == lineItemId);
        if (item == null) return;

        item.Quantity -= quantity;
        if (item.Quantity <= 0) ReceiptItems.Remove(item);
    }
}