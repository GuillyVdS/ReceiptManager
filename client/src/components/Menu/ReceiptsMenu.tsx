import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";

export const ReceiptsMenu = ({ onSelect }: { onSelect: (action: string) => void }) => {
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("Updated Line Items:", lineItems);
    }, [lineItems]);

    const fetchReceipts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/lineItems/receipt.pdf');
            if (!response.ok) throw new Error('Failed to fetch receipts');
            const data = await response.json();
            setLineItems(data.items);
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
            <Button variant="contained" color="primary" onClick={fetchReceipts}>
                Add new receipt
            </Button>
            <Button variant="contained" color="primary" onClick={() => onSelect('back')}>
                Back
            </Button>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>Line Items</h2>
            {lineItems.length > 0 ? (
                <ul>
                    {lineItems.map((item, index) => (
                        <li key={index}>{item.description} - {item.amount}</li>
                    ))}
                </ul>
            ) : (
                !loading && <p>No items found. and {lineItems.length}</p>
            )}
        </div>
    );
}