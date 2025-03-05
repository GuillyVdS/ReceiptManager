import { LineItems } from './LineItems';
import { roundAmount } from '../utils/helpers';

import path from 'path';

interface LineItem {
    description: string;
    amount: number;
}

export class Receipts extends LineItems {
    itemData: { [key: string]: LineItem[] } = {};

    constructor() {
        super();
    }

    async getCategoryTotals() {
        let categoryTotals: { [key: string]: number } = {};

        Object.keys(this.itemData).forEach(category => {
            const total = this.itemData[category].reduce((sum: number, item: LineItem) => {
                return roundAmount(sum + item.amount);
            }, 0);

            categoryTotals[category] = total;
        });

        return categoryTotals;
    }

    saveReceipt() { //saves the receipt to the current date and time
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "_"); // Replace invalid filename chars with '_'
        const receiptFilePath = path.join(__dirname, `../receipt_${timestamp}.json`);

        try {
            this.saveItemsToFile(receiptFilePath);
            //console.log('Receipt data saved successfully!');
        } catch (error) {
            console.error('Error saving receipt:', error);
        }
    }
}