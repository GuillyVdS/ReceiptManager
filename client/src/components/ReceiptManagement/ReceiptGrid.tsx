import { useState } from 'react';
import { GridColDef, GridRowModel } from '@mui/x-data-grid';
import { Button, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import Paper from '@mui/material/Paper';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import GenericGrid from '../Generics/GenericItemGrid';

interface TableProps {
    rows: any[];
    onBack: () => void;
    isNewReceipt: boolean;
}

interface Category {
    categoryId: number;
    categoryName: string;
}

async function fetchCategories(): Promise<Category[]> {
    const response = await axios.get('http://localhost:5152/api/receipt/categories');
    return response.data;
}

export default function ReceiptGrid({ rows, onBack, isNewReceipt }: TableProps) {
    const { data: categories, error, isLoading } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });
    const [updatedRows, setUpdatedRows] = useState(rows);

    const handleSave = async () => {
        try {
            await axios.post('http://localhost:5152/api/receipt/createReceipt', updatedRows);
            // Optionally add a confirmation here, maybe an alert or toast?
            toast.success('Receipt saved successfully!');
            onBack(); // Go back to the menu after saving
        } catch (error) {
            toast.error('Failed to save receipt.');
        }
    };

    const handleProcessRowUpdate = (newRow: GridRowModel) => {
        console.log('HERE: ', newRow);
        setUpdatedRows((prevRows) =>
            prevRows.map((row) =>
                row.itemId === newRow.itemId
                    ? { ...row, ...newRow, setDefaultCategory: newRow.setDefaultCategory ?? true } : row
            )
        );
        return newRow; // Return the updated row
    };

    const columns: GridColDef[] = [
        { field: 'itemId', headerName: 'ID', width: 50 },
        {
            field: 'categoryId',
            headerName: 'Allocated To:',
            width: 150,
            type: 'singleSelect',
            valueOptions: Array.isArray(categories)
                ? categories.map((category) => ({
                    value: category.categoryId,
                    label: category.categoryName,
                }))
                : [],
            editable: true
        },
        {
            field: 'setDefaultCategory',
            headerName: 'Set as Default Category',
            type: 'boolean',
            width: 180,
            editable: true,
        },
        {
            field: 'description',
            headerName: 'Item Description:',
            type: 'string',
            width: 500
        },
        {
            field: 'quantity',
            headerName: 'Item Quantity:',
            type: 'number',
            width: 150
        },
        {
            field: 'price',
            headerName: 'Item Price:',
            type: 'number',
            width: 150,
            valueGetter: (value: number) => {
                const price = value;
                return price != null ? `£${price.toFixed(2)}` : '';
            }
        },
    ];

    return (
        <Paper sx={{ height: '50vh', width: '100%' }}>
            <GenericGrid
                rows={updatedRows}
                columns={columns}
                getRowId={(row: { itemId: any; }) => row.itemId}
                processRowUpdate={handleProcessRowUpdate}
            />
            <Stack
                direction="row"
                spacing={2}
                sx={{ marginBottom: 2, justifyContent: 'center' }}>
                <Button variant="contained" color="primary" onClick={onBack}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={isNewReceipt}>
                    Save Receipt
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => console.log('Delete Receipt')}>
                    Delete Receipt
                </Button>
            </Stack>
        </Paper>
    );
}