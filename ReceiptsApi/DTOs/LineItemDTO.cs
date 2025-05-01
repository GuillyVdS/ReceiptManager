namespace ReceiptsApi.DTOs
{
    public class LineItemDTO
    {
        public int LineItemId { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }

    }
}