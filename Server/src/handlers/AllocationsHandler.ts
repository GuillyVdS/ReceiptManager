import { Allocations } from '../classes/Allocation';

interface ILineItem {
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

    public addItemToCategory(category: string, item: ILineItem) {
        const itemToAllocate: ILineItem = { description: item.description };
        this.allocations.addItemToCategory(category, itemToAllocate);
    }

    async saveAllocations() {
        await this.allocations.saveAllocations();
    }

    async resetAllocations() {
        this.allocations.resetItemData();
        await this.saveAllocations();
    }
}
