import inquirer from 'inquirer';
import { IReceiptLineItem, ILineItem } from '../classes/LineItem';
import { ReceiptCollection } from '../classes/ReceiptCollection';
import { AllocationCollection } from '../classes/AllocationCollection';
import { PdfHandler } from '../classes/PdfHandler';

export class ReceiptHandler {
    private receipt?: ReceiptCollection;
    private pdfHandler: PdfHandler;
    private allocations: AllocationCollection;

    constructor() {
        this.pdfHandler = new PdfHandler();
        this.allocations = new AllocationCollection();
        this.receipt = new ReceiptCollection();
    }

    private async createReceipt(filePath: string, personAName: string, personBName: string) {
        this.receipt?.resetItemData();

        // 🟢 Step 1: extract the line items from the PDF
        console.log("🔍 Starting PDF processing...");
        const items: IReceiptLineItem[] = await this.pdfHandler.processPDF(filePath);
        console.log(`📄 Extracted ${items.length} items from PDF.`);

        if (!items.length) {
            console.log('could not identify any line items in the PDF');
            return;
        }

        // 🟢 Step 2: Load existing allocations from allocations.json via AllocationsHandler
        const existingAllocations: Record<string, ILineItem[]> = this.allocations.getItems() as Record<string, ILineItem[]>;

        // 🟢 Step 3: process each line item
        await this.allocateLineItems(items, existingAllocations, personAName, personBName);

        // 🟢 Step 4: Compute and display the receipt totals and prompt to confirm receipt
        await this.printReceiptTotals();

        const answer = await inquirer.prompt({
            type: 'confirm',
            name: 'Save',
            message: "Do you want to save the receipt?"
        });

        // 🟢 Step 5: Save receipt and allocation data
        if (answer.Save) {
            await this.receipt!.saveReceipt();
            console.log("🧾 Receipt saved successfully.");
            await this.allocations.saveAllocations();
            console.log("💾 Allocations saved successfully.");
        } else {
            console.log('Cancelled Receipt');
        }
    }

    //takes extracted line items array and existing allocations json as input
    //for each item we first look if it exists anywhere in the existing allocations json
    //if it does not, the user will be prompted to assign the item to a category
    public async allocateLineItems(items: IReceiptLineItem[], existingAllocations: Record<string, ILineItem[]>, personAName: string, personBName: string) {
        //iterate over every line item
        for (const item of items) {
            console.log(`\n🔹 Checking allocation for item: "${item.description}" (£${item.amount.toFixed(2)})`);

            // Check if the item already exists in any category in existing allocations
            let allocatedCategory = '';

            for (const category of Object.keys(existingAllocations)) {
                const categoryItems = existingAllocations[category];

                // Ensure categoryItems is an array before calling some
                if (Array.isArray(categoryItems) && categoryItems.some((existingItem: ILineItem) => existingItem.description === item.description)) {
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
                await this.allocations.addItemToCategory(answer.allocation, item);

                allocatedCategory = answer.allocation;
            }

            //add line item to receipt
            console.log('allocating', item.description);
            await this.receipt!.addItemToCategory(allocatedCategory, item);
            console.log(`📌 Item "${item.description}" assigned to "${allocatedCategory}".`);
        }
    }

    private async printReceiptTotals() {
        const categoryTotals = await this.receipt!.getCategoryTotal();
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

        const pdfFilePath = await this.pdfHandler.selectPDFPrompt();

        if (!pdfFilePath) {
            //console.log("❌ No file selected, operation aborted.");
            return; // Abort if no file selected
        }

        // Process the PDF and allocate items
        await this.createReceipt(pdfFilePath, personAName, personBName);
    }
}



