import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/bill';
import UserFAB from './UserFAB';
import { Plus, Users, Trash2 } from 'lucide-react';

interface UserSetupProps {
  onUsersReady: (users: User[]) => void;
}

const UserSetup: React.FC<UserSetupProps> = ({ onUsersReady }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUserName, setNewUserName] = useState('');

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  const addUser = () => {
    if (newUserName.trim() && users.length < 8) {
      const newUser: User = {
        id: Date.now().toString(),
        name: newUserName.trim(),
        color: colors[users.length % colors.length]
      };
      setUsers([...users, newUser]);
      setNewUserName('');
    }
  };

  const removeUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addUser();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Who's Splitting?
        </h2>
        <p className="text-gray-600">
          Add the people who will be sharing this bill
        </p>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-center">
            Add People
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter name..."
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              maxLength={20}
            />
            <Button
              onClick={addUser}
              disabled={!newUserName.trim() || users.length >= 8}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {users.length >= 8 && (
            <p className="text-sm text-amber-600 text-center">
              Maximum 8 people allowed
            </p>
          )}
        </CardContent>
      </Card>

      {users.length > 0 && (
        <Card className="bg-white border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-center">
              People ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {users.map(user => (
                <div key={user.id} className="flex flex-col items-center space-y-2">
                  <UserFAB
                    user={user}
                    onClick={() => removeUser(user.id)}
                    size="md"
                  />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-20">
                      {user.name}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUser(user.id)}
                      className="text-red-500 hover:text-red-700 p-1 h-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => onUsersReady(users)}
        disabled={users.length < 2}
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        Continue with {users.length} {users.length === 1 ? 'Person' : 'People'}
      </Button>
      
      {users.length < 2 && (
        <p className="text-sm text-gray-500 text-center">
          Add at least 2 people to continue
        </p>
      )}
    </div>
  );
};

export default UserSetup;