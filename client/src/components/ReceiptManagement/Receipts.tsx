import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import DocumentList from "./DocumentsList";
import ReceiptGrid from "./ReceiptGrid";
import DocumentUpload from "./DocumentUpload";
import axios from "axios";
import ReceiptsList from "./ReceiptsList";

type view = 'menu' | 'documents' | 'receiptsList' | 'receiptGrid';

type FetchReceiptsParams =
    | { mode: 'document', document: string }
    | { mode: 'receipt', receiptId: number };

export const Receipts = ({ onSelect }: { onSelect: (action: string) => void }) => {
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshDocuments, setRefreshDocuments] = useState(false);
    const [view, setView] = useState<view>('menu');
    const [isNewReceipt, setIsNewReceipt] = useState(false);

    useEffect(() => {

    }, [lineItems]);

    const fetchReceipts = async (params: FetchReceiptsParams) => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (params.mode === 'document') {
                // Process PDF and get line items
                const response = await axios.post(`http://localhost:5152/api/pdf/processPDF/${params.document}`);
                if (response.status !== 200) throw new Error('Failed to process PDF');
                data = response.data;
                setIsNewReceipt(false);
            } else if (params.mode === 'receipt') {
                // Get line items for existing receipt
                const response = await axios.get(`http://localhost:5152/api/receipt/${params.receiptId}`);
                if (response.status !== 200) throw new Error('Failed to fetch receipt line items');
                data = response.data.items || response.data;
                setIsNewReceipt(true);
            }
            setLineItems(data);
            setView('receiptGrid');
        } catch (error) {
            setError('Error fetching receipts. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }

    };

    const handleUploadSuccess = () => {
        setRefreshDocuments(prev => !prev); // Toggle the state to trigger a refresh
    };

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
            {view === 'receiptGrid' && (
                <ReceiptGrid rows={lineItems}
                    onBack={() => setView('menu')}
                    isNewReceipt={isNewReceipt} />
            )}
            {view === 'receiptsList' && (
                <>
                    <h1>Manage Receipts</h1>
                    <ReceiptsList
                        onProcessReceipt={receiptId => fetchReceipts({ mode: 'receipt', receiptId: Number(receiptId) })}
                        refresh={refreshDocuments}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => setView('menu')}
                        style={{ marginTop: 16 }}
                    >
                        Back to Menu
                    </Button>
                </>
            )}
            {view === 'documents' && (
                <>
                    <h1>Manage Documents</h1>
                    <DocumentList onProcessFile={document => {
                        if (typeof document === 'string') {
                            fetchReceipts({ mode: 'document', document });
                        }
                    }} refresh={refreshDocuments} />
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
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}