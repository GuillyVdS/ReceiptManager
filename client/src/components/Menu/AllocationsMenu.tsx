export const AllocationsMenu = ({ onSelect }: { onSelect: (action: string) => void }) => (
    <div>
        <h1>Manage Item Allocations</h1>
        <button onClick={() => onSelect('viewAllocations')}>View current allocations</button>
        <button onClick={() => onSelect('removeItem')}>Remove item from allocations</button>
        <button onClick={() => onSelect('resetAllocations')}>Reset allocations</button>
        <button onClick={() => onSelect('back')}>Back</button>
    </div>
);
