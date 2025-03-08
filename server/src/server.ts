import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { ReceiptHandler } from './handlers/ReceiptHandler';
import { AllocationsHandler } from './handlers/AllocationsHandler';
import { PdfHandler } from './classes/PdfHandler';
import path from 'path';
import fs from 'fs';
import logger from './logger';

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

const uploadDir = path.join(__dirname, '../ReceiptData/PDFInput');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files to "uploads" directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    }
});

// File filter to allow only PDFs
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed!'));
    }
    cb(null, true);
};

const upload = multer({ storage, fileFilter });

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
        logger.error('Error fetching PDF list:', error);
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
        logger.error('Error fetching receipt data:', error);
        res.status(500).json({ error: 'Error fetching receipt data' });
    }
});

// API endpoint to handle file upload
app.post('/uploadPdf', (req: Request, res: Response): void => {
    upload.single('pdf')(req, res, (err: any) => {
        if (err) {
            logger.error('Error uploading file:', err);
            res.status(400).json({ error: err.message });
            return;
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({
            message: 'File uploaded successfully',
            filename: req.file.filename,
            filePath: `/uploads/${req.file.filename}`
        });
    });
});



// Start server
app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
});
