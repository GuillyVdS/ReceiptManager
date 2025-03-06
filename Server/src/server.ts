import express, { Request, Response } from 'express';
import cors from 'cors';
import { ReceiptHandler } from './handlers/ReceiptHandler';
import { AllocationsHandler } from './handlers/AllocationsHandler';
import { PdfHandler } from './classes/PdfHandler';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;
const INPUT_FOLDER = path.resolve(__dirname, '../ReceiptData/PDFInput');


// Middleware
app.use(express.json());

// ✅ Allow requests ONLY from port 5173
const corsOptions = {
    origin: 'http://localhost:5173', // Allow only this frontend
    methods: 'GET,POST,PUT,DELETE', // Allowed HTTP methods
    allowedHeaders: 'Content-Type,Authorization', // Allowed headers
};
app.use(cors());

const receiptHandler = new ReceiptHandler();
const allocationsHandler = new AllocationsHandler();
const pdfHandler = new PdfHandler();

//Routes
// 📂 1️⃣ Get List of PDF Files stored in /PDFInput Folder
app.get('/pdfList', (req: Request, res: Response) => {
    try {
        const pdfFiles = pdfHandler.getPDFList(INPUT_FOLDER);
        res.json({ pdfFiles });
    } catch (error) {
        res.status(500).json({ error: 'Error reading input folder' });
    }
});

app.get('/lineItems/:pdfName', async (req: Request, res: Response) => {
    const { pdfName } = req.params;
    const pdfFilePath = path.join(INPUT_FOLDER, pdfName);

    try {
        const items = await pdfHandler.processPDF(pdfFilePath);
        res.json({ items });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching receipt data' });
    }
});



// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
