import Button from "@mui/material/Button/Button";

export const AllocationsMenu = ({ onSelect }: { onSelect: (action: string) => void }) => (
    <div>
        <h1>Manage Item Allocations</h1>
        <Button variant="contained" color="primary" onClick={() => onSelect('viewAllocations')}>View current allocations</Button>
        <Button variant="contained" color="primary" onClick={() => onSelect('removeItem')}>Remove item from allocations</Button>
        <Button variant="contained" color="primary" onClick={() => onSelect('resetAllocations')}>Reset allocations</Button>
        <Button variant="contained" color="primary" onClick={() => onSelect('back')}>Back</Button>
    </div>
);
