using System.ComponentModel.DataAnnotations;

public class LineItem
{
    [Key]
    public int LineItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    //public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; }
    public ICollection<ReceiptLineItem> ReceiptItems { get; set; }
}
