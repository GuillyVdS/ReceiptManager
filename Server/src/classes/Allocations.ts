import { LineItems } from './LineItems';

interface LineItem {
    description: string;
}

export class Allocations extends LineItems {
    constructor() {
        super();
        this.filePath = 'allocations.json'; // location for storing allocation
    }

    saveAllocations() { //saves the allocations to the current date and time
        try {
            this.saveItemsToFile(this.filePath);
            //console.log('Allocations saved successfully!');
        } catch (error) {
            console.error('Error saving allocations:', error);
        }
    }
}
