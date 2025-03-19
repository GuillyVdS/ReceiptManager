using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class ReceiptLineItem
{
    [ForeignKey("Receipt")]
    public int ReceiptId { get; set; }
    public Receipt Receipt { get; set; } = null!;

    [ForeignKey("Item")]
    public int LineItemId { get; set; }
    public LineItem LineItem { get; set; } = null!;

    [ForeignKey("Category")]
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public decimal Price { get; set; }
    public int Quantity { get; set; }
}