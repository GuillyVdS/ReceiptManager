import { useState } from 'react';
import { List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { styled } from '@mui/system';

interface GenericListProps<T> {
    title: string;
    items: T[];
    getItemKey: (item: T) => string;
    getItemLabel: (item: T) => string;
    onItemSelect: (item: T | null) => void;
    selectedItem?: T | null; // <-- Add this line
}

const StyledList = styled(List)(({ theme }) => ({
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    margin: '20px auto',
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const GenericList = <T,>({
    title,
    items,
    getItemKey,
    getItemLabel,
    onItemSelect,
    selectedItem: controlledSelectedItem, // <-- Use this prop
}: GenericListProps<T>) => {
    const [uncontrolledSelectedItem, setUncontrolledSelectedItem] = useState<T | null>(null);

    // Use controlled selectedItem if provided, otherwise use internal state
    const selectedItem = controlledSelectedItem !== undefined ? controlledSelectedItem : uncontrolledSelectedItem;

    const handleItemClick = (item: T) => {
        const newSelected = selectedItem === item ? null : item;
        if (controlledSelectedItem === undefined) {
            setUncontrolledSelectedItem(newSelected);
        }
        onItemSelect(newSelected);
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                {title}
            </Typography>
            <StyledList>
                {items.map(item => (
                    <StyledListItem key={getItemKey(item)} disablePadding>
                        <ListItemButton
                            selected={selectedItem === item}
                            onClick={() => handleItemClick(item)}
                            sx={{
                                backgroundColor: selectedItem === item ? '#0056b3' : 'transparent',
                                color: selectedItem === item ? '#fff' : '#000',
                                '&.Mui-selected': {
                                    backgroundColor: '#0056b3',
                                    color: '#fff',
                                },
                                '&:hover': {
                                    backgroundColor: selectedItem === item ? '#004494' : '#1976d2',
                                    color: '#fff',
                                },
                            }}
                        >
                            <ListItemText primary={getItemLabel(item)} />
                        </ListItemButton>
                    </StyledListItem>
                ))}
            </StyledList>
        </div>
    );
};

export default GenericList;