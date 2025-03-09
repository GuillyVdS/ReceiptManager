import inquirer from 'inquirer';
import { ReceiptHandler } from './ReceiptHandler';
import { AllocationCollection } from '../classes/AllocationCollection';

export class Menu {
    private receiptHandler?: ReceiptHandler;
    private allocations?: AllocationCollection;

    constructor() {
    }

    // Main Menu
    async showMainMenu() {
        try {
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: [
                        'Manage Receipts',
                        'Manage Item Allocations',
                        'Exit'
                    ]
                }
            ]);

            switch (answers.action) {
                case 'Manage Receipts':
                    await this.showManageReceiptsMenu();
                    break;
                case 'Manage Item Allocations':
                    await this.showManageAllocationsMenu();
                    break;
                case 'Exit':
                    console.log('Goodbye!');
                    return;
            }

            await this.showMainMenu(); // Recurse for continuous menu display
        } catch (error) {
            console.error('Error during inquirer prompt:', error);
        }
    }

    //Receipts Menu
    async showManageReceiptsMenu() {
        if (!this.receiptHandler) {
            this.receiptHandler = new ReceiptHandler();
        }
        const answers = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'Manage Receipts',
            choices: [
                'Add new receipt',
                'Back'
            ]
        });

        switch (answers.action) {
            case 'Add new receipt':
                await this.receiptHandler.addNewReceipt();
                break;
            case 'Back':
                return; // Back to main menu
        }

        await this.showManageReceiptsMenu();
    }

    //Allocations Menu
    async showManageAllocationsMenu() {
        if (!this.allocations) {
            this.allocations = new AllocationCollection();
        }
        const answers = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'Manage Item Allocations',
            choices: [
                'View current allocations',
                'Remove item from allocations',
                'Reset allocations',
                'Back'
            ]
        });

        //let Allocations = await this.allocations.getItems();

        switch (answers.action) {
            case 'View current allocations':
                //await this.allocationsHandler.getExistingAllocations();
                break;
            case 'Remove item from allocations':
                //await this.allocationsHandler.removeItemFromAllocations();
                break;
            case 'Reset allocations':
                await this.allocations.resetItemData();
                break;
            case 'Back':
                return; // Back to main menu
        }

        await this.showManageAllocationsMenu();
    }
}
