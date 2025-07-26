import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/types/bill';
import { cn } from '@/lib/utils';

interface UserFABProps {
  user: User;
  isSelected?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const UserFAB: React.FC<UserFABProps> = ({ 
  user, 
  isSelected = false, 
  onClick, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-12 w-12 text-xs',
    md: 'h-16 w-16 text-sm',
    lg: 'h-20 w-20 text-base'
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        'rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl',
        sizeClasses[size],
        isSelected 
          ? 'ring-4 ring-white ring-opacity-50 scale-110 shadow-2xl' 
          : 'hover:scale-105'
      )}
      style={{ 
        backgroundColor: user.color,
        color: '#ffffff'
      }}
    >
      {user.name.charAt(0).toUpperCase()}
    </Button>
  );
};

export default UserFAB;