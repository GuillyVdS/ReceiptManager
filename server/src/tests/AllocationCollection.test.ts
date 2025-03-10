import { AllocationCollection } from '../classes/AllocationCollection';
import { ILineItem, LineItem } from '../classes/LineItem';
import fs from 'fs';

jest.mock('fs');

describe('AllocationFile Class', () => {
    let allocationCollection: AllocationCollection;

    beforeEach(() => {
        const initialData: Record<string, ILineItem[]> = {
            'Category1': [
                { description: 'Item 1' },
                { description: 'Item 2' }
            ],
            'Category2': [
                { description: 'Item 3' }
            ]
        };

        // Mock fs.readFileSync to return valid JSON data
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(initialData));

        allocationCollection = new AllocationCollection(initialData);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add a new item to the allocation', () => {
        const item: LineItem = new LineItem('Test Item');
        allocationCollection.addItemToCategory('TestCategory', item);
        expect(allocationCollection.getItems('TestCategory')).toContainEqual(item);
    });

    it('should remove an item from a category', () => {
        const item: LineItem = new LineItem('Item 1');
        allocationCollection.removeItemFromCategory('Category1', item);
        expect(allocationCollection.getItems('Category1')).not.toContainEqual(item);
    });

    it('should get item categories', () => {
        const categories = allocationCollection.getCategories();
        expect(categories).toEqual(['Category1', 'Category2']);
    });

    it('should get all items from a category', () => {
        const items = allocationCollection.getItems('Category1');
        expect(items).toEqual([{ description: 'Item 1' }, { description: 'Item 2' }]);
    });

    it('should save allocations to file', () => {
        const spy = jest.spyOn(fs, 'writeFileSync');
        allocationCollection.saveAllocations();
        expect(spy).toHaveBeenCalled();
    });

    it('should reset saved allocations', () => {
        const spy = jest.spyOn(fs, 'writeFileSync');
        allocationCollection.resetSavedAllocations();
        expect(spy).toHaveBeenCalled();
    });
});