import fs from 'fs';
import pdf from 'pdf-parse';

interface LineItem {
    description: string;
    amount: number;
}

export class PdfParser {
    async parsePdf(filePath: string): Promise<{ description: string; amount: number }[]> {
        const pdfBuffer = fs.readFileSync(filePath);
        const data = await pdf(pdfBuffer);

        console.log('📜 Extracted PDF Text:\n', data.text);

        // Step 1 - Extract and clean the relevant receipt info
        const cleanedReceiptText = this.extractAndCleanReceipt(data.text);

        //console.log('🧼 Cleaned Receipt Text (After Initial Sanitization):\n', cleanedReceiptText);

        //parse over receipt info and extract item descriptions and prices
        const items = this.parseLineItems(cleanedReceiptText);
        return items;
    }

    // Steps over the extracted PDF text and sanitizes the result.
    private extractAndCleanReceipt(text: string): string {
        const lines = text.split(/\r?\n/).map(line => line.trim());

        let foundItemList = false;
        let cleanedLines: string[] = [];
        let mergedLine = ''; // Store multi-line product descriptions

        // Define category words to be ignored
        const categoryWords = new Set(["Fridge", "Freezer", "Cupboard"]);

        let itemCount = 0; // Counter for valid items

        for (const line of lines) {
            // Step 1 - Find the start of the receipt
            if (!foundItemList) {
                if (line.includes("QtyProductUnit PriceTotal")) {
                    console.log('✅ Found itemized list start');
                    foundItemList = true;
                    continue; // Skip the header row
                } else {
                    continue; // Ignore everything before the itemized list
                }
            }

            // Step 2 - Stop when reaching the receipt end
            if (/Items marked with an .* include VAT at (20|5)%/.test(line)) {
                console.log('⛔ End of receipt detected. Stopping extraction.');
                break;
            }

            // Step 3 - Remove unwanted lines (discounts, dates, Gmail links, empty lines)
            if (
                /Was £\d+\.\d{2}, now £\d+\.\d{2}/.test(line) ||  // Ignore discount lines
                /^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/.test(line) || // Ignore timestamp lines
                /https?:\/\/mail\.google\.com/.test(line) ||      // Ignore URLs
                /Receipt for/.test(line) ||                       // Ignore receipt metadata
                line === ""                                       // Remove empty lines
            ) {
                console.log(`🗑️ Removing line: "${line}"`);
                continue;
            }

            // Step 4 - Remove † symbols
            let sanitizedLine = line.replace(/†/g, '').trim();

            // 🚨 Step 5 - Ignore category words if they appear alone
            if (categoryWords.has(sanitizedLine)) {
                console.log(`🔽 Skipping category word: "${sanitizedLine}"`);
                continue; // Skip this line entirely
            }

            // 🚨 Step 6 - Merge multi-line descriptions
            if (/£\d+\.\d{2}/.test(sanitizedLine)) {
                // This line contains a price → it's a complete product line
                if (mergedLine) {
                    sanitizedLine = (mergedLine + ' ' + sanitizedLine).replace(/\s*(£\d+\.\d{2})/g, '$1'); // Remove spaces before prices
                    mergedLine = ''; // Reset for next item
                }

                sanitizedLine = sanitizedLine.replace(/^\d+\s*/, ''); // This removes the leading quantity number (and any space after it)

                cleanedLines.push(sanitizedLine.replace(/\b(\d)\s+([A-Za-z])/g, '$1$2').trim());
                itemCount++; // Increment valid item count
            } else {
                // This line does NOT contain a price → it's part of the description
                mergedLine += (mergedLine ? ' ' : '') + sanitizedLine.trim(); // Trim to prevent space buildup
            }
        }

        console.log(`📦 Found ${itemCount} valid line items`);

        return cleanedLines.join('\n'); // Return cleaned & merged receipt block
    }


    //slightly redundant as most line items will already conform once passed through the extractAndCleanReceipt function, 
    //however this regex prevents any more invalid items from being added
    private parseLineItems(text: string): LineItem[] {
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
        const items: LineItem[] = [];

        const regex = /^(.+?)\s*£(\d+\.\d{2})\s*£(\d+\.\d{2})$/;

        for (const line of lines) {
            console.log(`Parsing line: "${line}"`);

            const match = line.match(regex);

            if (match) {
                const description = match[1].trim(); // Capture the product description
                const unitPrice = parseFloat(match[2]); // Capture the first price (unit price) we don't really use this for anything at the moment
                const totalAmount = parseFloat(match[3]); // Capture the second price (total amount)

                if (!isNaN(unitPrice) && !isNaN(totalAmount) && description.length > 0) {
                    items.push({ description, amount: totalAmount });
                    //console.log(`✅ Passed regex. Item added: "${description}", £${totalAmount}`);
                } else {
                    console.log(`❌ Invalid number format in item: "${line}"`);
                }
            } else {
                console.log(`❌ Failed regex: "${line}"`);
            }
        }

        return items;
    }

}
