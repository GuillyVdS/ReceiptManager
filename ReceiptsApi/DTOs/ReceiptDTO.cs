
namespace ReceiptsApi.DTOs
{
    public class ReceiptDTO
    {
        public int ReceiptId { get; set; }
        public DateTime Date { get; internal set; }
        public List<ReceiptLineItemDTO> Items { get; set; } = new();
    }
}