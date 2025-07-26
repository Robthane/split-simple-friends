import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BillItem, User } from '@/types/bill';
import UserFAB from './UserFAB';
import BillItemCard from './BillItemCard';
import { Users, ArrowRight, Check } from 'lucide-react';

interface ItemAllocationProps {
  items: BillItem[];
  users: User[];
  onAllocationComplete: (allocatedItems: BillItem[]) => void;
}

const ItemAllocation: React.FC<ItemAllocationProps> = ({ 
  items, 
  users, 
  onAllocationComplete 
}) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [allocatedItems, setAllocatedItems] = useState<BillItem[]>(items);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSharedMode, setIsSharedMode] = useState(false);

  const currentItem = allocatedItems[currentItemIndex];
  const progress = ((currentItemIndex + 1) / items.length) * 100;

  const handleUserSelect = (userId: string) => {
    if (isSharedMode) {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    } else {
      setSelectedUsers([userId]);
    }
  };

  const handleNext = () => {
    const updatedItems = [...allocatedItems];
    updatedItems[currentItemIndex] = {
      ...currentItem,
      assignedTo: selectedUsers,
      isShared: isSharedMode && selectedUsers.length > 1
    };
    
    setAllocatedItems(updatedItems);
    setSelectedUsers([]);
    setIsSharedMode(false);
    
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      onAllocationComplete(updatedItems);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Assign Items
        </h2>
        <p className="text-gray-600 mb-4">
          Item {currentItemIndex + 1} of {items.length}
        </p>
        <Progress value={progress} className="w-full h-2" />
      </div>

      <BillItemCard item={currentItem} className="mx-auto max-w-md" />

      <Card className="bg-white border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-lg">
            Who should pay for this item?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center space-x-4">
            <Button
              variant={!isSharedMode ? "default" : "outline"}
              onClick={() => {
                setIsSharedMode(false);
                setSelectedUsers([]);
              }}
              className="rounded-full"
            >
              Individual
            </Button>
            <Button
              variant={isSharedMode ? "default" : "outline"}
              onClick={() => {
                setIsSharedMode(true);
                setSelectedUsers([]);
              }}
              className="rounded-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Shared
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {users.map(user => (
              <UserFAB
                key={user.id}
                user={user}
                isSelected={selectedUsers.includes(user.id)}
                onClick={() => handleUserSelect(user.id)}
                size="lg"
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedUsers.length === 0}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {currentItemIndex < items.length - 1 ? (
              <>
                Next Item
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            ) : (
              <>
                Complete
                <Check className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemAllocation;