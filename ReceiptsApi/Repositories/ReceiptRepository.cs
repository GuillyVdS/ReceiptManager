using Microsoft.EntityFrameworkCore;
public class ReceiptRepository : IReceiptRepository
{
    private readonly ReceiptsContext _context;

    public ReceiptRepository(ReceiptsContext context)
    {
        _context = context;
    }

    public Receipt GetReceiptById(int receiptId)
    {
        return _context.Receipts
            .Include(r => r.ReceiptItems)
            .ThenInclude(ri => ri.LineItem)
            .Include(r => r.ReceiptItems)
            .ThenInclude(ri => ri.Category)
            .FirstOrDefault(r => r.ReceiptId == receiptId);
    }

    public List<Receipt> GetReceiptList()
    {
        return _context.Receipts
            .Include(r => r.ReceiptItems)
            .ThenInclude(ri => ri.LineItem)
            .Include(r => r.ReceiptItems)
            .ThenInclude(ri => ri.Category)
            .ToList();
    }

    public void AddReceipt(Receipt receipt)
    {
        _context.Receipts.Add(receipt);
        _context.SaveChanges();
    }
}