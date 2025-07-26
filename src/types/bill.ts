export interface BillItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
  isShared: boolean;
}

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Bill {
  id: string;
  items: BillItem[];
  users: User[];
  createdAt: Date;
}

export interface UserTotal {
  userId: string;
  userName: string;
  total: number;
  items: Array<{
    itemName: string;
    amount: number;
    isShared: boolean;
    sharedWith?: string[];
  }>;
}