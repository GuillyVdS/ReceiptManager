import { Allocations } from '../classes/Allocations';

interface LineItem {
    description: string;
}

export class AllocationsHandler {
    private allocations: Allocations;

    constructor() {
        this.allocations = new Allocations();
    }

    async getExistingAllocations() {
        return this.allocations.getFilteredLineItems();
    }

    public addItemToCategory(category: string, item: LineItem) {
        const itemToAllocate: LineItem = { description: item.description };
        this.allocations.addItemToCategory(category, itemToAllocate);
    }

    async saveAllocations() {
        await this.allocations.saveAllocations();
    }
}
