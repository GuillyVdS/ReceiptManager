import { useState } from "react";
import { Button } from "@mui/material";
import AllocationsGrid from "./AllocationsGrid";

type view = 'menu' | 'allocations' | 'itemList' | 'receiptGrid';

export const Allocations = ({ onSelect }: { onSelect: (action: string) => void }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<view>('menu');

    return (
        <div>
            {view === 'menu' && (
                <>
                    <h1>Allocations Menu</h1>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setView('allocations')}
                        style={{ marginRight: 8 }}
                    >
                        Manage Default Item Allocations
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                    //onClick={() => setView('confirmReset')}
                    >
                        Reset All Allocations
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onSelect('mainMenu')}
                    >
                        Back to Main Menu
                    </Button>
                </>
            )}
            {view === 'allocations' && (
                <AllocationsGrid onBack={() => setView('menu')} />
            )}
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}