import { useState } from 'react';
import { DataGrid, GridColDef, GridRowModel } from '@mui/x-data-grid';
import { Button, Stack } from '@mui/material';
import Paper from '@mui/material/Paper';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';



interface TableProps {
    rows: any[];
    onBack: () => void;
}

interface Category {
    categoryId: number;
    categoryName: string;
}

async function fetchCategories(): Promise<Category[]> {
    const response = await axios.get('http://localhost:5152/api/pdf/categories');
    return response.data;
}

export default function ReceiptGrid({ rows, onBack }: TableProps) {
    const { data: categories, error, isLoading } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });
    const [updatedRows, setUpdatedRows] = useState(rows);

    const handleSave = () => {
        axios.post('http://localhost:5152/api/pdf/createReceipt', updatedRows);
    };

    const handleProcessRowUpdate = (newRow: GridRowModel) => {
        console.log('HERE: ', newRow);
        setUpdatedRows((prevRows) =>
            prevRows.map((row) =>
                row.itemId === newRow.itemId ? { ...row, ...newRow } : row
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
            <DataGrid
                rows={updatedRows}
                columns={columns}
                getRowId={(row) => row.itemId}
                editMode="cell"
                disableVirtualization={true} // I do not work with huge data sets, so for performance, this can be disabled
                sx={{ border: 0 }}
                processRowUpdate={handleProcessRowUpdate}
            />
            <Stack
                direction="row"
                spacing={2}
                sx={{ marginBottom: 2, justifyContent: 'center' }}>
                <Button variant="contained" color="primary" onClick={onBack}>
                    Back
                </Button>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    Save Receipt
                </Button>
            </Stack>
        </Paper>
    );
}