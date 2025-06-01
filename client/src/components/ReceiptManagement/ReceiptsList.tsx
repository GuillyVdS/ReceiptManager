//should aim to inherit a generic list and then use this for both receipts and documents
import { useEffect } from 'react';
import { Button } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import GenericList from '../GenericList';

interface ReceiptsListProps {
    onProcessReceipt: (receipt: string | null) => void;
    refresh: boolean;
}

interface Receipt {
    id: string;
    name: string;
}

const fetchReceipts = async (): Promise<Receipt[]> => {
    const response = await axios.get<{ receipts: Receipt[] }>('http://localhost:5152/api/receipts/list');
    return response.data.receipts;
};

const ReceiptsList: React.FC<ReceiptsListProps> = ({ onProcessReceipt, refresh }) => {
    const queryClient = useQueryClient();
    const { data, error, isLoading } = useQuery<Receipt[]>({ queryKey: ['receipts'], queryFn: fetchReceipts });

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
                getItemKey={item => item.id}
                getItemLabel={item => item.name}
                onItemSelect={selected => onProcessReceipt(selected?.id || null)}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={() => onProcessReceipt(null)}
                disabled={!data || data.length === 0}
            >
                Process Selected Receipt
            </Button>
        </div>
    );
};

export default ReceiptsList;