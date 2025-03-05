export const ReceiptsMenu = ({ onSelect }: { onSelect: (action: string) => void }) => (
    <div>
        <h1>Manage Receipts</h1>
        <button onClick={() => onSelect('addReceipt')}>Add new receipt</button>
        <button onClick={() => onSelect('back')}>Back</button>
    </div>
);
