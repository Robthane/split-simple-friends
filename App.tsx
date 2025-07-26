import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User, BillItem } from './types/bill';
import { Camera, Users, DollarSign, Plus, Trash2, ArrowRight, Check } from 'lucide-react-native';

type AppStep = 'users' | 'capture' | 'allocate' | 'summary';

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [allocatedItems, setAllocatedItems] = useState<BillItem[]>([]);
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

  const handleUsersReady = () => {
    if (users.length >= 2) {
      setCurrentStep('capture');
    } else {
      Alert.alert('Error', 'Add at least 2 people to continue');
    }
  };

  const handleItemsExtracted = () => {
    // Simulate OCR processing
    const sampleItems: BillItem[] = [
      { id: '1', name: 'Burger Deluxe', price: 15.99, assignedTo: [], isShared: false },
      { id: '2', name: 'Caesar Salad', price: 12.50, assignedTo: [], isShared: false },
      { id: '3', name: 'Craft Beer', price: 8.00, assignedTo: [], isShared: false },
      { id: '4', name: 'Tax & Tip', price: 7.25, assignedTo: [], isShared: false }
    ];
    setBillItems(sampleItems);
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

  const renderUsersStep = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EasyBill</Text>
        <Text style={styles.subtitle}>Split bills effortlessly with friends</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.iconContainer}>
          <Users size={32} color="#3B82F6" />
        </View>
        <Text style={styles.sectionTitle}>Who's Splitting?</Text>
        <Text style={styles.sectionSubtitle}>Add the people who will be sharing this bill</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter name..."
          value={newUserName}
          onChangeText={setNewUserName}
          maxLength={20}
        />
        <TouchableOpacity
          style={[styles.addButton, (!newUserName.trim() || users.length >= 8) && styles.disabledButton]}
          onPress={addUser}
          disabled={!newUserName.trim() || users.length >= 8}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {users.length > 0 && (
        <View style={styles.usersContainer}>
          <Text style={styles.usersTitle}>People ({users.length})</Text>
          <View style={styles.usersGrid}>
            {users.map(user => (
              <View key={user.id} style={styles.userItem}>
                <View style={[styles.userAvatar, { backgroundColor: user.color }]}>
                  <Text style={styles.userInitial}>{user.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.userName}>{user.name}</Text>
                <TouchableOpacity onPress={() => removeUser(user.id)} style={styles.removeButton}>
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.continueButton, users.length < 2 && styles.disabledButton]}
        onPress={handleUsersReady}
        disabled={users.length < 2}
      >
        <Text style={styles.continueButtonText}>
          Continue with {users.length} {users.length === 1 ? 'Person' : 'People'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCaptureStep = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EasyBill</Text>
      </View>

      <View style={styles.captureContainer}>
        <View style={styles.iconContainer}>
          <Camera size={48} color="#8B5CF6" />
        </View>
        <Text style={styles.sectionTitle}>Capture Your Bill</Text>
        <Text style={styles.sectionSubtitle}>Take a photo or upload an image of your receipt</Text>
        
        <TouchableOpacity style={styles.captureButton} onPress={handleItemsExtracted}>
          <Text style={styles.captureButtonText}>Upload Bill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSummaryStep = () => {
    const userTotals = users.map(user => {
      let total = 0;
      allocatedItems.forEach(item => {
        if (item.assignedTo.includes(user.id)) {
          const amount = item.isShared ? item.price / item.assignedTo.length : item.price;
          total += amount;
        }
      });
      return { userId: user.id, userName: user.name, total };
    });

    const grandTotal = allocatedItems.reduce((sum, item) => sum + item.price, 0);

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>EasyBill</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <DollarSign size={32} color="#10B981" />
          </View>
          <Text style={styles.sectionTitle}>Bill Summary</Text>
          <Text style={styles.sectionSubtitle}>Here's how the bill breaks down</Text>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: ${grandTotal.toFixed(2)}</Text>
        </View>

        {userTotals.map(userTotal => {
          const user = users.find(u => u.id === userTotal.userId)!;
          return (
            <View key={userTotal.userId} style={styles.userSummaryCard}>
              <View style={styles.userSummaryHeader}>
                <View style={[styles.userAvatar, { backgroundColor: user.color }]}>
                  <Text style={styles.userInitial}>{user.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.userSummaryName}>{user.name}</Text>
                <Text style={styles.userSummaryTotal}>${userTotal.total.toFixed(2)}</Text>
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={styles.startOverButton} onPress={handleStartOver}>
          <Text style={styles.startOverButtonText}>Split Another Bill</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {currentStep === 'users' && renderUsersStep()}
      {currentStep === 'capture' && renderCaptureStep()}
      {currentStep === 'summary' && renderSummaryStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    backgroundColor: '#E0E7FF',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    marginRight: 12,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  usersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  usersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  userItem: {
    alignItems: 'center',
    marginBottom: 16,
    width: '30%',
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  removeButton: {
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  captureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalContainer: {
    backgroundColor: '#D1FAE5',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065F46',
    textAlign: 'center',
  },
  userSummaryCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  userSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userSummaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
  },
  userSummaryTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  startOverButton: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  startOverButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 