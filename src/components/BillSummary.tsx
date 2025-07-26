import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BillItem, User, UserTotal } from '@/types/bill';
import { DollarSign, Users, Receipt } from 'lucide-react';

interface BillSummaryProps {
  items: BillItem[];
  users: User[];
  onStartOver: () => void;
}

const BillSummary: React.FC<BillSummaryProps> = ({ items, users, onStartOver }) => {
  const calculateUserTotals = (): UserTotal[] => {
    return users.map(user => {
      let total = 0;
      const userItems: UserTotal['items'] = [];
      
      items.forEach(item => {
        if (item.assignedTo.includes(user.id)) {
          const amount = item.isShared 
            ? item.price / item.assignedTo.length 
            : item.price;
          
          total += amount;
          userItems.push({
            itemName: item.name,
            amount,
            isShared: item.isShared,
            sharedWith: item.isShared ? item.assignedTo : undefined
          });
        }
      });
      
      return {
        userId: user.id,
        userName: user.name,
        total,
        items: userItems
      };
    });
  };

  const userTotals = calculateUserTotals();
  const grandTotal = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <Receipt className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Bill Summary
        </h2>
        <p className="text-gray-600">
          Here's how the bill breaks down
        </p>
      </div>

      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-xl">
            <DollarSign className="h-6 w-6 mr-2 text-green-600" />
            Total: ${grandTotal.toFixed(2)}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {userTotals.map(userTotal => {
          const user = users.find(u => u.id === userTotal.userId)!;
          return (
            <Card key={userTotal.userId} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-lg font-semibold">{user.name}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${userTotal.total.toFixed(2)}
                  </div>
                </div>
              </CardHeader>
              
              {userTotal.items.length > 0 && (
                <CardContent className="pt-0">
                  <Separator className="mb-3" />
                  <div className="space-y-2">
                    {userTotal.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700">{item.itemName}</span>
                          {item.isShared && (
                            <Users className="h-3 w-3 text-purple-500" />
                          )}
                        </div>
                        <span className="font-medium">
                          ${item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Button
        onClick={onStartOver}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        Split Another Bill
      </Button>
    </div>
  );
};

export default BillSummary;