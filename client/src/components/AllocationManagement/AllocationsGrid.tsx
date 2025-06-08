import { useQuery } from '@tanstack/react-query';
import GenericItemGrid from '../Generics/GenericItemGrid';
import { Button, Paper, Stack } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface AllocationsGridProps {
    onBack: () => void;
}

interface Category {
    categoryId: number;
    categoryName: string;
}


const fetchAllItems = async () => {
    const response = await axios.get('http://localhost:5152/api/allocation/list');
    return response.data;
};

const fetchCategories = async (): Promise<Category[]> => {
    const response = await axios.get('http://localhost:5152/api/receipt/categories');
    return response.data;
};

export default function AllocationsGrid({ onBack }: AllocationsGridProps) {
    const { data: items, isLoading, error } = useQuery({
        queryKey: ['allItems'],
        queryFn: fetchAllItems,
    });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    // Local state for editable rows
    const [rows, setRows] = useState<any[]>([]);

    useEffect(() => {
        if (items && categories) {
            const mappedRows = items.map((item: any) => ({
                ...item,
                categoryName: categories.find(cat => cat.categoryId === item.categoryId)?.categoryName || '',
            }));
            setRows(mappedRows);
        }
    }, [items, categories]);

    const columns = [
        { field: 'lineItemId', headerName: 'ID', width: 50 },
        { field: 'description', headerName: 'Description', width: 300 },
        { field: 'categoryId', headerName: 'Category', width: 100, editable: true },
        { field: 'categoryName', headerName: 'Category Name', width: 200, editable: true },
    ];

    // Handle row update from GenericItemGrid
    const handleProcessRowUpdate = (newRow: any) => {
        setRows(prevRows =>
            prevRows.map(row =>
                row.lineItemId === newRow.lineItemId ? { ...row, ...newRow } : row
            )
        );
        return newRow;
    };

    // Save all changes to the server //this currently is a stub
    const handleSave = async () => {
        try {
            await axios.post('http://localhost:5152/api/allocation/save', rows);
            alert('Allocations saved!');
        } catch (err) {
            alert('Failed to save allocations.');
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>Error loading items</div>;

    return (
        <Paper sx={{ height: '60vh', width: '100%' }}>
            <GenericItemGrid
                rows={rows}
                columns={columns}
                getRowId={row => row.lineItemId}
                processRowUpdate={handleProcessRowUpdate}
            />
            <Stack direction="row" spacing={2} sx={{ margin: 2, justifyContent: 'center' }}>
                <Button variant="contained" onClick={handleSave}>Save</Button>
                <Button variant="contained" onClick={onBack}>Back</Button>
            </Stack>
        </Paper>
    );
}