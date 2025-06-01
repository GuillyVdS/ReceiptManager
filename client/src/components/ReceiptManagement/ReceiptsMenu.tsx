import Button from "@mui/material/Button/Button";

export const ReceiptsMenu = ({ onSelect }: { onSelect: (action: string) => void }) => (
    <div>
        <h1>Receipts Menu</h1>
        <Button variant="contained" color="primary" onClick={() => onSelect('processReceipt')}>
            Upload & Process Receipt
        </Button>
        <Button variant="contained" color="primary" onClick={() => onSelect('receiptsList')}>
            View Receipts List
        </Button>
        <Button variant="contained" color="primary" onClick={() => onSelect('mainMenu')}>
            Back to Main Menu
        </Button>
    </div>
);