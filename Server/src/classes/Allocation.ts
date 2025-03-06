import { LineItem } from './LineItem';


export class Allocations extends LineItem {
    constructor() {
        super();
        this.filePath = 'allocations.json'; // location for storing allocation
    }

    public override resetItemData() {
        console.log("🔄 Resetting allocations to default structure...");

        // Load existing allocations to keep person names
        let existingAllocations: any = this.getItemCategories();

        // Create a new structure
        let resetAllocations: any = {};
        existingAllocations.forEach((category: string | number) => {
            resetAllocations[category] = {
                items: [{ description: "Default Line Item" }]
            };
        });

        // Update this.itemData and save the new structure
        this.itemData = resetAllocations;
        this.saveAllocations();

        console.log("✅ allocations.json has been reset.");
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
