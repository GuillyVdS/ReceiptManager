// src/components/Menu/Menu.tsx
import { useState } from 'react';
import { MainMenu } from './MainMenu';
import { Receipts } from '../ReceiptManagement/Receipts';
import { Allocations } from '../AllocationManagement/Allocations';

export const Menu = ({ onExit }: { onExit: () => void }) => {
  const [currentMenu, setCurrentMenu] = useState<'mainMenu' | 'receiptsList' | 'receipts' | 'manageAllocations' | 'processReceipt'>('mainMenu');

  const handleAction = (action: string) => {
    switch (action) {
      case 'receiptsMenu':
        setCurrentMenu('receipts');
        break;
      case 'processReceipt':
        setCurrentMenu('processReceipt');
        break;
      case 'receiptsList':
        setCurrentMenu('receiptsList');
        break;
      case 'manageAllocations':
        setCurrentMenu('manageAllocations');
        break;
      case 'exit':
        onExit(); // Trigger exit
        break;
      case 'addReceipt':
        setCurrentMenu('receipts');
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
      case 'mainMenu':
        setCurrentMenu('mainMenu');
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {currentMenu === 'mainMenu' && <MainMenu onSelect={handleAction} />}
      {currentMenu === 'receipts' && <Receipts onSelect={handleAction} />}
      {currentMenu === 'manageAllocations' && <Allocations onSelect={handleAction} />}
    </div>
  );
};
