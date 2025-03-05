import { Menu } from './handlers/Menu';

async function main() {
    const menu = new Menu();

    //Start menu loop
    await menu.showMainMenu();
}

main();
