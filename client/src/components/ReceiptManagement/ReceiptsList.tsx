import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import GenericList from '../Generics/GenericList';

interface ReceiptsListProps {
    onProcessReceipt: (lineItems: any[] | null) => void;
    onBack: () => void;
    refresh: boolean;
}

interface Receipt {
    receiptId: number;
    receiptName: string;
}

const fetchReceipts = async (): Promise<Receipt[]> => {
    const response = await axios.get<{ receipts: Receipt[] }>('http://localhost:5152/api/receipt/list');
    return response.data.receipts;
};

const fetchReceiptLineItems = async (receiptId: number) => {
    const response = await axios.get(`http://localhost:5152/api/receipt/${receiptId}`);
    if (response.status !== 200) throw new Error('Failed to fetch receipt line items');
    return response.data.items || response.data;
};

const ReceiptsList: React.FC<ReceiptsListProps> = ({ onProcessReceipt, onBack, refresh }) => {
    const queryClient = useQueryClient();
    const { data, error, isLoading } = useQuery<Receipt[]>({ queryKey: ['receipts'], queryFn: fetchReceipts });
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['receipts'] });
        setSelectedReceipt(null);
    }, [refresh, queryClient]);

    const handleViewDetails = async () => {
        if (!selectedReceipt) return;
        setProcessing(true);
        try {
            const lineItems = await fetchReceiptLineItems(selectedReceipt.receiptId);
            onProcessReceipt(lineItems);
        } catch (err) {
            alert('Failed to fetch receipt details');
            onProcessReceipt(null);
        } finally {
            setProcessing(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>An error occurred: {error.message}</div>;

    return (
        <div>
            <h1>Manage Receipts</h1>
            <GenericList
                title="Receipts"
                items={data || []}
                getItemKey={item => item.receiptId}
                getItemLabel={item => `${item.receiptId} - ${new Date(item.receiptName).toLocaleDateString()}`}
                onItemSelect={setSelectedReceipt}
                selectedItem={selectedReceipt}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleViewDetails}
                disabled={!selectedReceipt || processing}
            >
                {processing ? "Loading..." : "View Receipt Details"}
            </Button>
            <Button
                variant="outlined"
                onClick={onBack}
                style={{ marginTop: 16, marginLeft: 8 }}
            >
                Back to Menu
            </Button>
        </div>
    );
};

export default ReceiptsList;