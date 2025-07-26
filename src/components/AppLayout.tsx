import React, { useState } from 'react';
import { User, BillItem } from '@/types/bill';
import UserSetup from './UserSetup';
import CameraCapture from './CameraCapture';
import ItemAllocation from './ItemAllocation';
import BillSummary from './BillSummary';

type AppStep = 'users' | 'capture' | 'allocate' | 'summary';

const AppLayout: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [allocatedItems, setAllocatedItems] = useState<BillItem[]>([]);

  const handleUsersReady = (selectedUsers: User[]) => {
    setUsers(selectedUsers);
    setCurrentStep('capture');
  };

  const handleItemsExtracted = (items: BillItem[]) => {
    setBillItems(items);
    setCurrentStep('allocate');
  };

  const handleAllocationComplete = (items: BillItem[]) => {
    setAllocatedItems(items);
    setCurrentStep('summary');
  };

  const handleStartOver = () => {
    setCurrentStep('users');
    setUsers([]);
    setBillItems([]);
    setAllocatedItems([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            EasyBill
          </h1>
          <p className="text-gray-600">
            Split bills effortlessly with friends
          </p>
        </div>

        {currentStep === 'users' && (
          <UserSetup onUsersReady={handleUsersReady} />
        )}
        
        {currentStep === 'capture' && (
          <CameraCapture onItemsExtracted={handleItemsExtracted} />
        )}
        
        {currentStep === 'allocate' && (
          <ItemAllocation 
            items={billItems}
            users={users}
            onAllocationComplete={handleAllocationComplete}
          />
        )}
        
        {currentStep === 'summary' && (
          <BillSummary 
            items={allocatedItems}
            users={users}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
};

export default AppLayout;