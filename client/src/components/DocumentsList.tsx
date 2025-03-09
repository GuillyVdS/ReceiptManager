import { useState, useEffect } from 'react';
import { Button, List, ListItem, ListItemButton, ListItemText, TextField } from '@mui/material';

interface DocumentListProps {
    onProcessFile: (document: string | null) => void; // Parent handler function
}

const DocumentList: React.FC<DocumentListProps> = ({ onProcessFile }) => {
    const [documents, setDocuments] = useState<string[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
    const [fileUpload, setFileUpload] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState<string>('');

    useEffect(() => {
    }, [documents]);

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

    // Fetch document list when component mounts
    useEffect(() => {
        fetchDocuments();
    }, []);

    useEffect(() => {
        //when fileUpload changes, update the document name to match the file name
        if (fileUpload) {
            setDocumentName(fileUpload.name);
        }
    }, [fileUpload]);

    const handleFileUpload = async () => {
        if (!fileUpload) {
            alert("Please select a file to upload.");
            return;
        }

        if (!documentName) {
            alert("Please enter a document name.");
            return;
        }

        // Create FormData object to send as multipart/form-data
        const formData = new FormData();
        formData.append('pdf', fileUpload);  // 'pdf' is the field name on the server
        formData.append('documentName', documentName);  // Add the document name to the form data

        try {
            // Post the file to the server
            const response = await fetch('http://localhost:5000/uploadPdf', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            const result = await response.json();
            console.log('File uploaded successfully:', result);
            alert("File uploaded successfully!");

            // Optionally, refresh the list of documents
            fetchDocuments();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert("File upload failed.");
        }
    };

    const handleItemClick = (doc: string) => {
        setSelectedDocument(prevSelected => {
            const newSelected = prevSelected === doc ? null : doc;
            return newSelected;
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFileUpload(event.target.files[0]);
        }
    };

    const handleDocumentNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDocumentName(event.target.value);
    };

    return (
        <div>
            <h2>Documents</h2>
            <List>
                {documents.map((doc, index) => (
                    <ListItem key={index} disablePadding>
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
                    </ListItem>
                ))}
            </List>
            <Button
                variant="contained"
                color="primary"
                onClick={() => onProcessFile(selectedDocument)} // Call the parent function with the selectedDocument
                disabled={!selectedDocument} // Disable if no document is selected
            >
                Process Selected File
            </Button>
            <h3>Add a Document</h3>
            <form>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="file"
                        onChange={handleFileChange}
                    />
                    <TextField
                        label="Document Name"
                        value={documentName}
                        onChange={handleDocumentNameChange}
                        margin="normal"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        type="button"
                        disabled={!fileUpload || !documentName}
                        onClick={handleFileUpload}>
                        Upload Document
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default DocumentList;
