import { LineItem } from '../classes/LineItem';

describe('LineItem Class', () => {
    let lineItem: LineItem;

    beforeEach(() => {
        lineItem = new LineItem();
    });

    it('should initialize with empty itemData', () => {
        expect(lineItem.getItemData()).toEqual({});
    });

    it('should add item to category', () => {
        const item = { description: 'Test Item' };
        lineItem.addItemToCategory('TestCategory', item);
        expect(lineItem.getItemData()['TestCategory']).toContainEqual(item);
    });

    it('should reset itemData', () => {
        lineItem.addItemToCategory('TestCategory', { description: 'Test Item' });
        lineItem.resetItemData();
        expect(lineItem.getItemData()).toEqual({});
    });
});