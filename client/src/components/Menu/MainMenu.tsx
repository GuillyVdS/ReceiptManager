export const MainMenu = ({ onSelect }: { onSelect: (action: string) => void }) => (
    <div>
        <h1>Main Menu</h1>
        <button onClick={() => onSelect('manageReceipts')}>Manage Receipts</button>
        <button onClick={() => onSelect('manageAllocations')}>Manage Item Allocations</button>
        <button onClick={() => onSelect('exit')}>Exit</button>
    </div>
);
