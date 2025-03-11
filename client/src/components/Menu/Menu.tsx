// src/components/Menu/Menu.tsx
import { useState } from 'react';
import { MainMenu } from './MainMenu';
import { Receipts } from '../ReceiptManagement/Receipts';
import { Allocations } from '../AllocationManagement/Allocations';

export const Menu = ({ onExit }: { onExit: () => void }) => {
  const [currentMenu, setCurrentMenu] = useState<'mainMenu' | 'manageReceipts' | 'manageAllocations'>('mainMenu');

  const handleAction = (action: string) => {
    switch (action) {
      case 'manageReceipts':
        setCurrentMenu('manageReceipts');
        break;
      case 'manageAllocations':
        setCurrentMenu('manageAllocations');
        break;
      case 'exit':
        onExit(); // Trigger exit
        break;
      case 'addReceipt':
        setCurrentMenu('manageReceipts');
        break;
      case 'viewAllocations':
        console.log('View current allocations');
        break;
      case 'removeItem':
        console.log('Remove item from allocations');
        break;
      case 'resetAllocations':
        console.log('Reset allocations');
        break;
      case 'back':
        setCurrentMenu('mainMenu');
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {currentMenu === 'mainMenu' && <MainMenu onSelect={handleAction} />}
      {currentMenu === 'manageReceipts' && <Receipts onSelect={handleAction} />}
      {currentMenu === 'manageAllocations' && <Allocations onSelect={handleAction} />}
    </div>
  );
};
