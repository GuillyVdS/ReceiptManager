import fs from 'fs';

interface LineItem {
    description: string;
}

export class LineItems {
    protected itemData: Record<string, LineItem[]>;
    protected filePath = '';

    constructor() {
        this.itemData = {};
    }

    public resetItemData(): void {
        this.itemData = {};
    }

    public loadItemData(): void {
        let filePath = this.filePath !== '' ? this.filePath : null;
        if (filePath) {
            try {
                const rawData = fs.readFileSync(filePath, 'utf-8');
                this.itemData = JSON.parse(rawData);
            } catch (error) {
                console.error('Error loading allocations:', error);
                this.itemData = {}; // Return empty object if file doesn't exist or is invalid
            }
        }
    }

    public getFilteredLineItems() {
        const filteredLineItems: Record<string, LineItem[]> = {};

        if (Object.keys(this.itemData).length === 0) {
            this.loadItemData();
        }

        // Filter out empty categories
        Object.keys(this.itemData).forEach(category => {
            if (this.itemData[category]?.length > 0) {
                filteredLineItems[category] = this.itemData[category];
            }
        });

        return filteredLineItems;
    }

    public getItemCategories(): string[] {
        return Object.keys(this.itemData);
    }

    public addItemToCategory(category: string, item: LineItem) {
        if (!Array.isArray(this.itemData[category])) {
            this.itemData[category] = [];
        }
        // Check if the item already exists in the category
        const itemExists = this.itemData[category].some(existingItem => existingItem.description === item.description);
        if (!itemExists) {
            this.itemData[category].push(item);
        }
    }

    public saveItemsToFile(filepath: string) {
        try {
            fs.writeFileSync(filepath, JSON.stringify(this.itemData, null, 2), 'utf-8');
        } catch (error) {
            console.error('Error saving itemData:', error);
        }
    }
}
