namespace ReceiptsApi.DTOs
{
    public class ReceiptDTO
    {
        public int ReceiptId { get; set; }
        public List<ReceiptLineItemDTO> Items { get; set; } = new();
    }
}