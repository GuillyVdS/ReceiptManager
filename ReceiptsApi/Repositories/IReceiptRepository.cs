public interface IReceiptRepository
{
    Receipt GetReceiptById(int receiptId);
    void AddReceipt(Receipt receipt);
}