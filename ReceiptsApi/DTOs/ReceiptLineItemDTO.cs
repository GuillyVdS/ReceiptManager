namespace ReceiptsApi.DTOs
{
    public class ReceiptLineItemDTO
    {
        public int ItemId { get; set; }
        public string Description { get; set; } = string.Empty;
        public int categoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;

        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}