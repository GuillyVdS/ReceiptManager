public interface IReceiptRepository
{
    Receipt GetReceiptById(int receiptId);
    List<Receipt> GetReceiptList();
    void AddReceipt(Receipt receipt);
}