import { DataGrid, GridColDef, GridRowModel } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

interface GenericItemGridProps {
    rows: any[];
    columns: GridColDef[];
    getRowId: (row: any) => string | number;
    processRowUpdate?: (newRow: GridRowModel) => GridRowModel;
}

export default function GenericItemGrid({ rows, columns, getRowId, processRowUpdate }: GenericItemGridProps) {
    return (
        <Paper sx={{ height: '50vh', width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={getRowId}
                editMode="cell"
                disableVirtualization={true}
                sx={{ border: 0 }}
                processRowUpdate={processRowUpdate}
            />
        </Paper>
    );
}