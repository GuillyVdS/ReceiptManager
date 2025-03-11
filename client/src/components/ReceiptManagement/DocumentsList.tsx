import { useState, useEffect } from 'react';
import { Button, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { styled } from '@mui/system';

interface DocumentListProps {
    onProcessFile: (document: string | null) => void; // Parent handler function
    refresh: boolean; // Prop to trigger refresh
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

const DocumentList: React.FC<DocumentListProps> = ({ onProcessFile, refresh }) => {
    const [documents, setDocuments] = useState<string[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

    const fetchDocuments = async () => {
        try {
            const response = await fetch('http://localhost:5000/pdfList');
            const data = await response.json();
            const pdfFiles: string[] = data.pdfFiles || [];

            setDocuments(pdfFiles);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    // Fetch document list when component mounts or when refresh prop changes
    useEffect(() => {
        fetchDocuments();
    }, [refresh]);

    const handleItemClick = (doc: string) => {
        setSelectedDocument(prevSelected => {
            const newSelected = prevSelected === doc ? null : doc;
            return newSelected;
        });
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Documents
            </Typography>
            <StyledList>
                {documents.map((doc, index) => (
                    <StyledListItem key={index} disablePadding>
                        <ListItemButton
                            selected={selectedDocument === doc}
                            onClick={() => handleItemClick(doc)}
                            sx={{
                                // Override backgroundColor for the selected state
                                backgroundColor: selectedDocument === doc ? '#0056b3' : 'transparent',
                                color: selectedDocument === doc ? '#fff' : '#000',  // Text color for selected item
                                '&.Mui-selected': {
                                    backgroundColor: '#0056b3',  // Override the default selected background color
                                    color: '#fff',  // Ensure text is white when selected
                                },
                                '&:hover': {
                                    backgroundColor: selectedDocument === doc ? '#004494' : '#1976d2',  // Hover state for selected vs unselected
                                    color: '#fff',  // Hover text color
                                }
                            }}
                        >
                            <ListItemText primary={doc} />
                        </ListItemButton>
                    </StyledListItem>
                ))}
            </StyledList>
            <Button
                variant="contained"
                color="primary"
                onClick={() => onProcessFile(selectedDocument)} // Call the parent function with the selectedDocument
                disabled={!selectedDocument} // Disable if no document is selected
            >
                Process Selected File
            </Button>
        </div>
    );
};

export default DocumentList;
