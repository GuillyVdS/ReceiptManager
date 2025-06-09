import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import GenericList from '../Generics/GenericList';

interface DocumentListProps {
    onProcessFile: (lineItems: any[] | null) => void; // Now expects line items, not just document name
    refresh: boolean;
}

interface Document {
    originalName: string;
    baseName: string;
}

const fetchDocuments = async (): Promise<Document[]> => {
    const response = await axios.get<{ pdfFiles: Document[] }>('http://localhost:5152/api/pdf/pdfList');
    return response.data.pdfFiles;
};

const processPdf = async (document: string) => {
    const response = await axios.post(`http://localhost:5152/api/pdf/processPDF/${document}`);
    if (response.status !== 200) throw new Error('Failed to process PDF');
    return response.data;
};

const DocumentsList: React.FC<DocumentListProps> = ({ onProcessFile, refresh }) => {
    const queryClient = useQueryClient();
    const { data, error, isLoading } = useQuery<Document[]>({ queryKey: ['documents'], queryFn: fetchDocuments });
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (refresh) {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            setSelectedDocument(null);
        }
    }, [refresh, queryClient]);

    const handleProcess = async () => {
        if (!selectedDocument) return;
        setProcessing(true);
        try {
            const lineItems = await processPdf(selectedDocument.baseName);
            onProcessFile(lineItems);
        } catch (err) {
            alert('Failed to process PDF');
            onProcessFile(null);
        } finally {
            setProcessing(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>An error occurred: {error.message}</div>;

    return (
        <div>
            <GenericList
                title="Documents"
                items={data || []}
                getItemKey={item => item.baseName}
                getItemLabel={item => item.originalName}
                onItemSelect={setSelectedDocument}
                selectedItem={selectedDocument}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleProcess}
                disabled={!selectedDocument || processing}
            >
                {processing ? "Processing..." : "Process Selected File"}
            </Button>
        </div>
    );
};

export default DocumentsList;