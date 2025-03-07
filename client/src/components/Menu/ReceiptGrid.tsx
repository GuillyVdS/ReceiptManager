import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

interface TableProps {
    rows: any[]; 
}

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'category', headerName: 'Allocated To: ', width: 150 },
    {
        field: 'description',
        headerName: 'Item Description: ',
        type: 'string',
        width: 500,
    },
    {
        field: 'amount',
        headerName: 'Item Amount:',
        type: 'number',
        //description: 'This column has a value getter and is not sortable.',
        //sortable: false,
        width: 150,
        valueGetter: (value: number) => {
            const amount = value;
            return amount != null ? `£${amount.toFixed(2)}` : '';
        },
        //valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
    },
];

//const paginationModel = { page: 0, pageSize: 5 };

export default function ReceiptGrid({ rows }: TableProps) {
    return (
        <Paper sx={{ height: '50vh', width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                disableVirtualization={true} //i do not work with huge data sets so for perfomance this can be disabled
                //initialState={{ pagination: { paginationModel } }}
                //pageSizeOptions={[5, 10]}
                //checkboxSelection
                sx={{ border: 0 }}
            />
        </Paper>
    );
}