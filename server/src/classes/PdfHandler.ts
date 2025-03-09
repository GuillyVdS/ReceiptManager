import inquirer from 'inquirer';
import fs from 'fs';
import pdf from 'pdf-parse';
import path from 'path';

import { IReceiptLineItem } from './LineItem';
import { SanitizePdf } from './SanitizePdf';

export class PdfHandler {
    private static pdfDirectory = path.resolve(__dirname, '../../ReceiptData/PDFInput');

    constructor() {
    }

    // Prompt user to select a PDF file
    public async selectPDFPrompt(): Promise<string | undefined> {
        const pdfFiles = this.getPDFList(PdfHandler.pdfDirectory);

        if (pdfFiles.length === 0) {
            console.log("❌ No PDF files found.");
            return undefined;
        }

        const pdfSelection = await inquirer.prompt([{
            type: 'list',
            name: 'selectedPdf',
            message: 'Select a PDF file to process:',
            choices: ['Cancel', ...pdfFiles]
        }]);

        if (pdfSelection.selectedPdf === 'Cancel') {
            console.log("❌ Operation cancelled.");
            return undefined;
        }

        const pdfFilePath = path.join(PdfHandler.pdfDirectory, pdfSelection.selectedPdf);
        console.log(`📂 Selected PDF: ${pdfFilePath}`);
        return pdfFilePath;
    }

    // Get List of PDFs from selected directory (This can remain synchronous as it is a simple directory read operation)
    public getPDFList(pdfDirectory: string): string[] {
        return fs.readdirSync(pdfDirectory)
            .filter(file => file.endsWith('.pdf'));
    }

    // Process the selected PDF file and returns the extracted linitems
    public async processPDF(pdfFilePath: string): Promise<IReceiptLineItem[]> {
        let items: IReceiptLineItem[] = [];

        try {
            const pdfBuffer = await fs.promises.readFile(pdfFilePath);
            const pdfData = await pdf(pdfBuffer); // Parsing the PDF

            console.log('📜 Extracted PDF Text:\n', pdfData.text);

            const cleanedReceiptText = SanitizePdf.sanitizeExtractedPDF(pdfData.text);
            items = SanitizePdf.getLineItems(cleanedReceiptText);
        } catch (error) {
            console.error('Error parsing PDF:', error);
            throw error;
        }

        return items;
    }

}
