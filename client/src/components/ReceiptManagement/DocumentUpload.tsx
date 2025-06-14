import { useState, useEffect } from 'react';
import { Button, TextField, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';

interface DocumentUploadProps {
    onFileUpload?: (document: string | null) => void; // Optional parent handler function
    onUploadSuccess: () => void; // Callback function to refresh the document list
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
}));

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess }) => {
    const [fileUpload, setFileUpload] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState<string>('');
    const [showUpload, setShowUpload] = useState<boolean>(false);

    useEffect(() => {
        // When fileUpload changes, update the document name to match the file name
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
        formData.append('documentName', sanitizeDocNameInput(documentName));
        // it is very important to ensure the document name comes before the file,
        // on the server, Multer does not appear able to catch any additional fields after the last file has been received..
        formData.append('pdf', fileUpload);  // 'pdf' is the field name on the server

        try {
            // Post the file to the server
            const response = await axios.post('http://localhost:5152/api/pdf/uploadPdf', formData, {
                //const response = await axios.post('http://localhost:5000/uploadPdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('File uploaded successfully:', response);
            alert("File uploaded successfully!");

            // Hide the upload form after successful upload
            setShowUpload(false);

            onUploadSuccess();

        } catch (error) {
            console.error('Error uploading file:', error);
            alert("File upload failed.");
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFileUpload(event.target.files[0]);
        }
    };

    const toggleUpload = () => {
        setShowUpload(prevShowUpload => !prevShowUpload);
    };

    const sanitizeDocNameInput = (name: string) => {
        // Remove invalid characters
        let sanitize = name.replace(/[\/\\:*?"<>|]/g, '');
        // Remove path traversal
        sanitize = sanitize.replace(/\.\./g, '');
        // Trim whitespace
        sanitize = sanitize.trim();
        // Limit length
        sanitize = sanitize.substring(0, 100);
        // Enforce .pdf
        if (!sanitize.endsWith('.pdf') || sanitize.length == 0) {
            return sanitize + '.pdf';
        }
        return sanitize;
    }

    return (
        <div>
            {showUpload && (
                <StyledPaper>
                    <Typography variant="h5" gutterBottom>
                        Add a Document
                    </Typography>
                    <form>
                        <Box display="flex" alignItems="center" gap={2}>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                id="file-upload"
                            />
                            <label htmlFor="file-upload">
                                <Button variant="contained" component="span">
                                    Choose File
                                </Button>
                            </label>
                            <TextField
                                label="Document Name"
                                value={documentName}
                                onChange={(e) => setDocumentName(sanitizeDocNameInput(e.target.value))}
                                onBlur={() => setDocumentName(sanitizeDocNameInput(documentName))}
                                margin="normal"
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                type="button"
                                disabled={!fileUpload || !documentName}
                                onClick={handleFileUpload}
                            >
                                Upload Document
                            </Button>
                            <Button variant="contained" color="secondary" onClick={toggleUpload}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </StyledPaper>
            )}
            {!showUpload && (
                <Button variant="contained" color="primary" onClick={toggleUpload}>
                    Upload a new Receipt
                </Button>
            )}
        </div>
    );
};

export default DocumentUpload;
