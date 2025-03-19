using System.ComponentModel.DataAnnotations;

public class Category
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
    public ICollection<LineItem> LineItems { get; set; }
    public ICollection<ReceiptLineItem> ReceiptItems { get; set; }
}
