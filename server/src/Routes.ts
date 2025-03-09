import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import logger from './logger';
import { PdfHandler } from './classes/PdfHandler';

const router = Router();
const INPUT_FOLDER = path.resolve(__dirname, '../../ReceiptData/PDFInput');
const uploadDir = path.join(__dirname, '../../ReceiptData/PDFInput');
const pdfHandler = new PdfHandler();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed!'));
    }
    cb(null, true);
};

const upload = multer({ storage, fileFilter });

//router endpoints
//get pdf list
//get processed line items of single pdf
//get existing allocated line items
//upload new pdf to pdf list
//post allocations

router.get('/pdfList', (req: Request, res: Response) => {
    try {
        const pdfFiles = pdfHandler.getPDFList(INPUT_FOLDER);
        res.json({ pdfFiles });
    } catch (error) {
        logger.error('Error fetching PDF list:', error);
        res.status(500).json({ error: 'Error reading input folder' });
    }
});

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

router.post('/uploadPdf', (req: Request, res: Response): void => {
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

//get line item allocations
router.get('//itemAllocations', (req: Request, res: Response) => {
    try {
        const pdfFiles = pdfHandler.getPDFList(INPUT_FOLDER);
        res.json({ pdfFiles });
    } catch (error) {
        logger.error('Error fetching PDF list:', error);
        res.status(500).json({ error: 'Error reading input folder' });
    }
});

export default router;