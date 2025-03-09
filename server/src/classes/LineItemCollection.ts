import path from 'path';
import { ILineItem } from './LineItem';
import fs from 'fs';

export class LineItemCollection<T extends ILineItem> {
    protected itemData: Record<string, T[]> = {};
    protected filePath?: string;

    constructor(filePath?: string, initialData?: Record<string, T[]>) {
        if (filePath) {
            this.filePath = filePath;
            this.loadItemsFromFile();
        }

        //can set itemData on instantiation for testing purposes
        if (initialData) {
            this.itemData = initialData;
        }
    }

    //adds new item to category, if submitted category does not exist, it creates a new category
    addItemToCategory(category: string, item: T) {
        if (!Array.isArray(this.itemData[category])) {
            this.itemData[category] = [];
        }
        this.itemData[category].push(item);
    }

    removeItemFromCategory(category: string, item: T) {
        if (Array.isArray(this.itemData[category])) {
            this.itemData[category] = this.itemData[category].filter(i => i.description !== item.description);
        }
    }

    getCategories(): string[] {
        return Object.keys(this.itemData);
    }

    getItems(category?: string): T[] | Record<string, T[]> {
        if (category) {
            return this.itemData[category] || [];
        } else {
            return this.itemData;
        }
    }

    saveItemsToFile(filePath?: string) {
        const pathToSave = filePath || this.filePath;
        if (!pathToSave) {
            throw new Error('File path is not provided.');
        }

        try {
            fs.writeFileSync(pathToSave, JSON.stringify(this.itemData, null, 2));
            console.log('Data saved successfully!');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    loadItemsFromFile(filePath?: string) {
        const pathToLoad = filePath || this.filePath;
        if (!pathToLoad) {
            throw new Error('File path is not provided.');
        }

        try {
            const rawData = fs.readFileSync(pathToLoad, 'utf-8');
            this.itemData = JSON.parse(rawData);
        } catch (error) {
            console.error('Error loading data:', error);
            this.itemData = {};
        }
    }

    resetItemData() {
        const defaultStructure = fs.readFileSync(path.join(__dirname, '../../ReceiptData/AllocationStructure.json'), 'utf-8');
        this.itemData = JSON.parse(defaultStructure);
    }
}