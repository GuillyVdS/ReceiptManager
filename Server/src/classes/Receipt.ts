import { ILineItem, LineItem } from './LineItem';
import { roundAmount } from '../utils/helpers';

import path from 'path';

export interface IReceiptLineItem extends ILineItem {
    amount: number;
}


export class Receipt extends LineItem {
    itemData: { [key: string]: IReceiptLineItem[] } = {};

    constructor() {
        super();
    }

    async getCategoryTotals() {
        let categoryTotals: { [key: string]: number } = {};

        Object.keys(this.itemData).forEach(category => {
            const total = this.itemData[category].reduce((sum: number, item: IReceiptLineItem) => {
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