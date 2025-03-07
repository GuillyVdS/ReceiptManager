import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import ReceiptGrid from "./ReceiptGrid";
import DocumentList from "../DocumentsList";

export const ReceiptsMenu = ({ onSelect }: { onSelect: (action: string) => void }) => {
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        //console.log("Updated Line Items:", lineItems);
    }, [lineItems]);

    const fetchReceipts = async (document: string | null) => {
        if (!document) {
            console.log('No document selected');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/lineItems/${document}`);
            if (!response.ok) throw new Error('Failed to fetch receipts');
            const data = await response.json();

            // Map the server response to match the column structure
            const mappedItems = data.items.map((item: any, index: number) => ({
                id: index + 1,
                category: 'TEST',
                description: item.description,
                amount: item.amount
            }));

            setLineItems(mappedItems);  // Update the state with the mapped items
        } catch (error) {
            setError('Error fetching receipts. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Manage Receipts</h1>
            <DocumentList onProcessFile={fetchReceipts} />
            {/* <Button variant="contained" color="primary" onClick={fetchReceipts}>
                Add new receipt
            </Button> */}
            <Button variant="contained" color="primary" onClick={() => onSelect('back')}>
                Back
            </Button>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>Line Items</h2>
            {lineItems.length > 0 ? (
                <ReceiptGrid rows={lineItems} />
            ) : (
                !loading && <p>No items found. and {lineItems.length}</p>
            )}
        </div>
    );
}