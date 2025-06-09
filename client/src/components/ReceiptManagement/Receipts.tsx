import { useState } from "react";
import ReceiptGrid from "./ReceiptGrid";
import ReceiptsList from "./ReceiptsList";
import DocumentsList from "./DocumentsList";
import DocumentUpload from "./DocumentUpload";
import { Button } from "@mui/material";

type View = 'menu' | 'documents' | 'receiptsList' | 'receiptGrid';

export const Receipts = ({ onSelect }: { onSelect: (action: string) => void }) => {
    const [view, setView] = useState<View>('menu');
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [isNewReceipt, setIsNewReceipt] = useState(false);
    const [refreshDocuments, setRefreshDocuments] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleShowLineItems = (items: any[] | null, isNew: boolean = true) => {
        if (items) {
            setLineItems(items);
            setIsNewReceipt(isNew);
            setView('receiptGrid');
        }
    };

    const handleUploadSuccess = () => setRefreshDocuments(prev => !prev);

    return (
        <div>
            {view === 'menu' && (
                <>
                    <h1>Receipts Menu</h1>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setView('documents')}
                        style={{ marginRight: 8 }}
                    >
                        Upload & Process Receipt
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setView('receiptsList')}
                    >
                        View Receipts List
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onSelect('mainMenu')}
                    >
                        Back to Main Menu
                    </Button>
                </>
            )}
            {view === 'documents' && (
                <>
                    <DocumentsList
                        onProcessFile={items => handleShowLineItems(items, false)}
                        refresh={refreshDocuments}
                    />
                    <DocumentUpload onUploadSuccess={handleUploadSuccess} />
                    <Button
                        variant="outlined"
                        onClick={() => setView('menu')}
                        style={{ marginTop: 16 }}
                    >
                        Back to Menu
                    </Button>
                </>
            )}
            {view === 'receiptsList' && (
                <ReceiptsList
                    onProcessReceipt={items => handleShowLineItems(items, true)}
                    onBack={() => setView('menu')}
                    refresh={refreshDocuments}
                />
            )}
            {view === 'receiptGrid' && (
                <ReceiptGrid
                    rows={lineItems}
                    onBack={() => setView('menu')}
                    isNewReceipt={isNewReceipt}
                />
            )}
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}
        </div>
    );
};