import Button from "@mui/material/Button/Button";

export const MainMenu = ({ onSelect }: { onSelect: (action: string) => void }) => (
    <div>
        <h1>Main Menu</h1>
        <Button variant="contained" color="primary" onClick={() => onSelect('manageReceipts')}>
            Manage Receipts
        </Button>
        <Button variant="contained" color="primary" onClick={() => onSelect('manageAllocations')}>
            Manage Item Allocations
        </Button>
        <Button variant="contained" color="primary" onClick={() => onSelect('exit')}>
            Exit
        </Button>
    </div>
);
