import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from './logger';
import { PdfHandler } from './classes/PdfHandler';

const router = Router();
const pdfHandler = new PdfHandler();

const INPUT_FOLDER = path.resolve(__dirname, '../ReceiptData/PDFInput');
const ALLOCATIONS_FILE = path.resolve(__dirname, '../ReceiptData/allocations.json');
const UPLOADS = path.join(__dirname, '../ReceiptData/PDFInput');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS);
    },
    filename: (req, file, cb) => {
        let documentName = req.body.documentName || file.originalname;
        const timestamp = Date.now();
        const ext = path.extname(documentName);
        const baseName = path.basename(documentName, ext);
        documentName = `${baseName}-${timestamp}${ext}`;

        cb(null, documentName);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed!'));
    }
    cb(null, true);
};

const upload = multer({ storage, fileFilter });

//PDF Routes
//############################################################################################################

//get list of pdf files in the input folder
router.get('/pdfList', (req: Request, res: Response) => {
    try {
        const pdfFiles = pdfHandler.getPDFList(INPUT_FOLDER);
        // Remove timestamps from filenames for client ease of viewing
        const fileNames = pdfFiles.map(file => {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            const originalName = baseName.replace(/-\d+$/, '') + ext;
            return originalName;
        });
        res.json({ pdfFiles: fileNames });
    } catch (error) {
        logger.error('Error fetching PDF list:', error);
        res.status(500).json({ error: 'Error reading input folder' });
    }
});

//upload a pdf file to the server
router.post('/uploadPdf', (req, res, next) => {
    upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'documentName', maxCount: 1 }])(req, res, (err) => {
        if (err) {
            logger.error('Error parsing form data:', err);
            return res.status(400).json({ error: err.message });
        }

        res.json({
            message: 'File uploaded successfully'
        });
    });
});

//given a pdf name, extract and return the line items from the pdf
router.get('/lineItems/:pdfName', async (req: Request, res: Response) => {
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

//Allocation Routes
//############################################################################################################

//get data stored in allocations file
router.get('/allocations', (req: Request, res: Response) => {
    try {
        const allocationsData = fs.readFileSync(ALLOCATIONS_FILE, 'utf-8');
        const allocations = JSON.parse(allocationsData);
        res.json(allocations);
    } catch (error) {
        logger.error('Error fetching allocations file:', error);
        res.status(500).json({ error: 'Error reading allocations file' });
    }
});

//todo route for posting and updating allocations


export default router;