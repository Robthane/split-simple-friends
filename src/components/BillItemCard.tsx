import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BillItem } from '@/types/bill';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign } from 'lucide-react';

interface BillItemCardProps {
  item: BillItem;
  className?: string;
}

const BillItemCard: React.FC<BillItemCardProps> = ({ item, className }) => {
  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 truncate">
            {item.name}
          </h3>
          <div className="flex items-center bg-green-100 px-3 py-1 rounded-full">
            <DollarSign className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-lg font-bold text-green-700">
              ${item.price.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {item.assignedTo.length > 0 ? `${item.assignedTo.length} assigned` : 'Unassigned'}
            </span>
          </div>
          
          {item.isShared && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Shared
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BillItemCard;