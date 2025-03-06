// src/components/Menu/Menu.tsx
import React, { useState } from 'react';
import { MainMenu } from './MainMenu';
import { ReceiptsMenu } from './ReceiptsMenu';
import { AllocationsMenu } from './AllocationsMenu';

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
      {currentMenu === 'manageReceipts' && <ReceiptsMenu onSelect={handleAction} />}
      {currentMenu === 'manageAllocations' && <AllocationsMenu onSelect={handleAction} />}
    </div>
  );
};
