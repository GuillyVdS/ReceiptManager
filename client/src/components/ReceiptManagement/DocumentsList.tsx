import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import GenericList from '../GenericList';

interface DocumentListProps {
    onProcessFile: (document: string | null) => void;
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

const DocumentList: React.FC<DocumentListProps> = ({ onProcessFile, refresh }) => {
    const queryClient = useQueryClient();
    const { data, error, isLoading } = useQuery<Document[]>({ queryKey: ['documents'], queryFn: fetchDocuments });
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    useEffect(() => {
        if (refresh) {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            setSelectedDocument(null);
        }

    }, [refresh]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>An error occurred: {error.message}</div>;
    }

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
                onClick={() => onProcessFile(selectedDocument?.baseName || null)}
                disabled={!selectedDocument}
            >
                Process Selected File
            </Button>
        </div>
    );
};

export default DocumentList;