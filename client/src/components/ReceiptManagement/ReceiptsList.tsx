//should aim to inherit a generic list and then use this for both receipts and documents
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import GenericList from '../GenericList';

interface ReceiptsListProps {
    onProcessReceipt: (receipt: number | null) => void;
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

const ReceiptsList: React.FC<ReceiptsListProps> = ({ onProcessReceipt, refresh }) => {
    const queryClient = useQueryClient();
    const { data, error, isLoading } = useQuery<Receipt[]>({ queryKey: ['receipts'], queryFn: fetchReceipts });
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['receipts'] });
    }, [refresh, queryClient]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>An error occurred: {error.message}</div>;
    }

    return (
        <div>
            <GenericList
                title="Receipts"
                items={data || []}
                getItemKey={item => item.receiptId}
                getItemLabel={item => `${item.receiptId} - ${new Date(item.receiptName).toLocaleDateString()}`}
                onItemSelect={setSelectedReceipt}
                selectedItem={selectedReceipt}
            //onItemSelect={selected => onProcessReceipt(selected?.receiptId?.toString() || null)}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={() => onProcessReceipt(selectedReceipt?.receiptId || null)}
                disabled={!selectedReceipt}
            //disabled={!data || data.length === 0}
            >
                View Receipt Details
            </Button>
        </div>
    );
};

export default ReceiptsList;