import { ReceiptCollection } from '../classes/ReceiptCollection';
import { IReceiptLineItem, ReceiptLineItem } from '../classes/LineItem';
import fs from 'fs';
import path from 'path';

jest.mock('fs');

describe('Receipt Class', () => {
    let receiptCollection: ReceiptCollection;

    beforeEach(() => {
        const initialData: Record<string, IReceiptLineItem[]> = {
            'Category1': [
                {
                    description: 'Item 1',
                    amount: 10.99
                },
                {
                    description: 'Item 2',
                    amount: 5.49
                },
                {
                    description: 'Item 3',
                    amount: 2.75
                }
            ],
            'Category2': [
                {
                    description: 'Item 3',
                    amount: 2.75
                }
            ]
        };
        receiptCollection = new ReceiptCollection(initialData);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add a new item to the receipt', () => {
        const item: IReceiptLineItem = new ReceiptLineItem('Test Item', 3.50);
        receiptCollection.addItemToCategory('TestCategory', item);
        expect(receiptCollection.getItems('TestCategory')).toContainEqual(item);
    });

    it('should remove an item from a category', () => {
        const item: IReceiptLineItem = new ReceiptLineItem('Item 1', 10.99);
        receiptCollection.removeItemFromCategory('Category1', item);
        expect(receiptCollection.getItems('Category1')).not.toContainEqual(item);
    });

    it('should get item categories', () => {
        const categories = receiptCollection.getCategories();
        expect(categories).toEqual(['Category1', 'Category2']);
    });

    it('should get all items from a category', () => {
        const items = receiptCollection.getItems('Category1');
        expect(items).toEqual([
            { description: 'Item 1', amount: 10.99 },
            { description: 'Item 2', amount: 5.49 },
            { description: 'Item 3', amount: 2.75 }
        ]);
    });

    it('should get category totals', async () => {
        const categoryTotals = await receiptCollection.getCategoryTotal();
        expect(categoryTotals).toEqual({ 'Category1': 19.23, 'Category2': 2.75 });
    });

    it('should save receipt data to a file', () => {
        const spy = jest.spyOn(fs, 'writeFileSync');

        const date = new Date();
        const dateString = date.toISOString().split('T')[0];
        const receiptFilePathPattern = new RegExp(`^${path.join(__dirname, `../../ReceiptData/Processed/receipt-${dateString}`).replace(/\\/g, '\\\\')}.*$`);

        receiptCollection.saveReceipt();

        expect(spy).toHaveBeenCalled();
        const [filePath, fileContent] = spy.mock.calls[0];
        expect(filePath).toMatch(receiptFilePathPattern);
        expect(fileContent).toBe(JSON.stringify(receiptCollection['itemData'], null, 2));
    });

    it('should reset saved receipt data', () => {
        receiptCollection.resetItemData();
        expect(receiptCollection.getItems()).toEqual({});
    });

});