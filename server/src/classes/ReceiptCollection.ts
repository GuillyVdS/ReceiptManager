import { IReceiptLineItem } from './LineItem';
import { LineItemCollection } from './LineItemCollection';
import { roundAmount } from '../utils/helpers';
import path from 'path';
import fs from 'fs';

export class ReceiptCollection extends LineItemCollection<IReceiptLineItem> {
    constructor(initialData?: Record<string, IReceiptLineItem[]>) {
        super(undefined, initialData);
    }

    async getCategoryTotal() {
        let categoryTotals: { [key: string]: number } = {};

        Object.keys(this.itemData).forEach(category => {
            const items = this.itemData[category];
            console.log('CATEGORY ITEMS:', items);
            if (Array.isArray(items)) {
                const total = items.reduce((sum: number, item: IReceiptLineItem) => {
                    return roundAmount(sum + item.amount);
                }, 0);
                categoryTotals[category] = total;
            } else {
                console.error(`Expected an array for category ${category}, but got:`, items);
            }
        });

        return categoryTotals;
    }

    saveReceipt() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const receiptDir = path.join(__dirname, '../../ReceiptData/Processed');
        const receiptFilePath = path.join(receiptDir, `receipt-${timestamp}.json`);

        try {
            // Ensure the directory exists
            fs.mkdirSync(receiptDir, { recursive: true });

            this.saveItemsToFile(receiptFilePath);
            console.log('Receipt data saved successfully!');
        } catch (error) {
            console.error('Error saving receipt:', error);
        }
    }
    //function override for resetitemdata which sets item.data to empty object;
    public override resetItemData() {
        this.itemData = {};
    }
}
export { IReceiptLineItem };

