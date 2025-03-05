import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { AllocationsHandler } from './AllocationsHandler';
import { Receipts } from '../classes/Receipts';
import { PdfParser } from '../classes/PdfParser';

interface LineItem {
    description: string;
    amount: number;
}

export class ReceiptHandler {
    private pdfParser: PdfParser;
    private receipts: Receipts;
    private allocationsHandler: AllocationsHandler;

    constructor() {
        this.pdfParser = new PdfParser();
        this.allocationsHandler = new AllocationsHandler();
        this.receipts = new Receipts;
    }

    private async processReceipt(filePath: string, personAName: string, personBName: string) {
        console.log("🔍 Starting PDF processing...");

        // 🟢 Step 1: extract the line items from the PDF
        const items: LineItem[] = await this.pdfParser.parsePdf(filePath);
        console.log(`📄 Extracted ${items.length} items from PDF.`);

        if (!items.length) {
            console.log('could not identify any line items in the PDF');
            return;
        }

        // 🟢 Step 2: Load existing allocations from allocations.json via AllocationsHandler
        const existingAllocations = await this.allocationsHandler.getExistingAllocations();

        if (Object.keys(existingAllocations).length === 0) {
            console.log("⚠️ No existing allocations found. Starting fresh.");
        } else {
            console.log("📂 Loaded existing allocations:");
        }

        //clear item data for receipts
        this.receipts.resetItemData();

        // 🟢 Step 3: process each line item
        for (const item of items) {
            console.log(`\n🔹 Checking allocation for item: "${item.description}" (£${item.amount.toFixed(2)})`);

            // Check if the item already exists in any category in existing allocations
            let allocatedCategory = '';

            for (const category of Object.keys(existingAllocations)) {
                const categoryItems = existingAllocations[category] || [];

                // If the item is found in the existing allocations file, auto assign it
                if (categoryItems.some((existingItem: any) => (existingItem as LineItem).description === item.description)) {
                    allocatedCategory = category;
                    console.log(`✅ Found existing allocation for item "${item.description}" in "${category}".`);
                    break;
                }
            }

            // If the item isn't found in any category, ask the user for allocation
            if (!allocatedCategory) {
                console.log(`❓ No existing allocation found for "${item.description}". User input is required.`);

                const answer = await inquirer.prompt({
                    type: 'list',
                    name: 'allocation',
                    message: `Who should pay for this item? "${item.description}" (£${item.amount.toFixed(2)})`,
                    choices: [personAName, personBName, 'Shared', 'Unknown']
                });

                //assign new line item to category in allocations.json
                await this.allocationsHandler.addItemToCategory(answer.allocation, item);

                allocatedCategory = answer.allocation;
            }

            //add line item to receipt
            console.log('allocating', item.description);
            await this.receipts.addItemToCategory(allocatedCategory, item);
            console.log(`📌 Item "${item.description}" assigned to "${allocatedCategory}".`);

        }

        // 🟢 Step 4: Compute and display the receipt totals and prompt to confirm receipt
        const categoryTotals = await this.receipts.getCategoryTotals();
        console.log("Receipt TOTALS:", JSON.stringify(categoryTotals, null, 2));
        let receiptTotal = 0;

        console.log("\n📊 Final Allocation Totals:");
        Object.keys(categoryTotals).forEach(category => {
            if (category === 'shared') {
                console.log(`🔸 Shared: £${categoryTotals['shared']}`);
                receiptTotal += categoryTotals['shared'];
            } else {
                console.log(`🔹 ${category}: £${categoryTotals[category]}`);
                receiptTotal += categoryTotals[category];
            }
        });

        console.log(`\n💰 Total cost: £${receiptTotal}`);

        const answer = await inquirer.prompt({
            type: 'confirm',
            name: 'Save',
            message: "Do you want to save the receipt?"
        });

        // 🟢 Step 5: Save receipt and allocation data
        if (answer.Save) {
            await this.receipts.saveReceipt();
            console.log("🧾 Receipt saved successfully.");
            await this.allocationsHandler.saveAllocations();
            console.log("💾 Allocations saved successfully.");
        } else {
            console.log('Cancelled Receipt');
        }
    }

    public async selectPDFFile(): Promise<string | undefined> {
        const projectRoot = path.resolve(__dirname, '..', '..');
        const pdfDirectory = path.join(projectRoot, 'ReceiptData', 'PDFInput');
        let pdfFilePath;

        // Fetch available PDFs
        let pdfFiles = fs.readdirSync(pdfDirectory)
            .filter(file => file.endsWith('.pdf'));

        if (pdfFiles.length === 0) {
            console.log("❌ No PDF files found in the directory.");
            return undefined; // Return undefined if no PDF is found
        }

        //User prompt for pdf file
        const pdfSelection = await inquirer.prompt([{
            type: 'list',
            name: 'selectedPdf',
            message: 'Select a PDF file to process:',
            choices: ['Cancel', ...pdfFiles]
        }]);

        if (pdfSelection.selectedPdf === 'Cancel') {
            console.log("❌ Operation cancelled.");
            pdfFilePath = undefined; //
        }

        if (pdfFilePath) {
            pdfFilePath = path.join(pdfDirectory, pdfSelection.selectedPdf);
            console.log(`📂 Selected PDF: ${pdfFilePath}`);
        }

        return pdfFilePath;
    }

    public async addNewReceipt(): Promise<void> {
        console.log("Starting to process the new receipt...");

        // Prompt user for display names of personA and personB
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'personAName',
                message: 'Enter the name of Person A:'
            },
            {
                type: 'input',
                name: 'personBName',
                message: 'Enter the name of Person B:'
            }
        ]);

        const { personAName, personBName } = answers;

        const pdfFilePath = await this.selectPDFFile();

        if (!pdfFilePath) {
            //console.log("❌ No file selected, operation aborted.");
            return; // Abort if no file selected
        }

        // Process the PDF and allocate items
        await this.processReceipt(pdfFilePath, personAName, personBName);
    }
}



