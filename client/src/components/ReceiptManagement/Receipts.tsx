import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import DocumentList from "./DocumentsList";
import ReceiptGrid from "./ReceiptGrid";
import DocumentUpload from "./DocumentUpload";
import axios from "axios";
import ReceiptsList from "./ReceiptsList";

type view = 'menu' | 'documents' | 'receiptsList' | 'receiptGrid';

export const Receipts = ({ onSelect }: { onSelect: (action: string) => void }) => {
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshDocuments, setRefreshDocuments] = useState(false);
    const [showReceiptGrid, setShowReceiptGrid] = useState(false);
    const [view, setView] = useState<view>('menu');

    useEffect(() => {

    }, [lineItems]);

    const fetchReceipts = async (document: string | null) => {
        if (!document) {
            console.log('No document selected');
            return;
        }
        setLoading(true);
        setError(null);
        try {

            const response = await axios.post(`http://localhost:5152/api/pdf/processPDF/${document}`);
            if (response.status !== 200) throw new Error('Failed to fetch receipts');
            const data = response.data;

            setLineItems(data);  // Update the state with the mapped items for dotnet server

            //node functionality######################
            //const response = await fetch(`http://localhost:5000/lineItems/${document}`);
            //if (!response.ok) throw new Error('Failed to fetch receipts');
            //const data = await response.json();

            // Map the server response to match the column structure
            // const mappedItems = data.items.map((item: any, index: number) => ({
            //     id: index + 1,
            //     category: 'TEST',
            //     description: item.description,
            //     amount: item.amount
            // }));

            //setLineItems(mappedItems);
            //############################################

            setShowReceiptGrid(true); // Show the ReceiptGrid
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
                <ReceiptGrid rows={lineItems} onBack={() => setView('documents')} />
            )}
            {view === 'receiptsList' && (
                <>
                    <h1>Manage Receipts</h1>
                    <ReceiptsList
                        onProcessReceipt={() => setView('receiptGrid')}
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
                    <DocumentList onProcessFile={fetchReceipts} refresh={refreshDocuments} />
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