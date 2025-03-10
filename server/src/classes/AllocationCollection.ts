import { ILineItem } from './LineItem';
import { LineItemCollection } from './LineItemCollection';
import path from 'path';

export class AllocationCollection extends LineItemCollection<ILineItem> {
    constructor(initialData?: Record<string, ILineItem[]>) {
        const filePath = path.resolve(__dirname, '../../ReceiptData/allocations.json');
        super(filePath, initialData);
    }

    saveAllocations() {
        try {
            this.saveItemsToFile();
            console.log('Allocations saved successfully!');
        } catch (error) {
            console.error('Error saving allocations:', error);
        }
    }

    resetSavedAllocations() {
        this.resetItemData();
        this.saveAllocations();
    }
}

