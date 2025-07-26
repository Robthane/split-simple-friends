import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isSelected: boolean;
}

interface ReceiptParserProps {
  ocrResult: {
    text: string;
    confidence: number;
    items: ReceiptItem[];
  };
  onItemsConfirmed: (items: ReceiptItem[]) => void;
  onBack: () => void;
}

export const ReceiptParser: React.FC<ReceiptParserProps> = ({ 
  ocrResult, 
  onItemsConfirmed, 
  onBack 
}) => {
  const [items, setItems] = useState<ReceiptItem[]>(
    ocrResult.items.map((item, index) => ({
      ...item,
      id: `item-${index}`,
      quantity: 1,
      isSelected: true,
    }))
  );

  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const toggleItemSelection = (itemId: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, isSelected: !item.isSelected }
          : item
      )
    );
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const startEditing = (item: ReceiptItem) => {
    setEditingItem(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
  };

  const saveEdit = () => {
    if (!editingItem) return;
    
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    setItems(prev => 
      prev.map(item => 
        item.id === editingItem 
          ? { ...item, name: editName.trim(), price }
          : item
      )
    );
    
    setEditingItem(null);
    setEditName('');
    setEditPrice('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditPrice('');
  };

  const addManualItem = () => {
    const newItem: ReceiptItem = {
      id: `item-${Date.now()}`,
      name: 'New Item',
      price: 0,
      quantity: 1,
      isSelected: true,
    };
    setItems(prev => [...prev, newItem]);
    startEditing(newItem);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const confirmItems = () => {
    const selectedItems = items.filter(item => item.isSelected);
    if (selectedItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to continue');
      return;
    }
    onItemsConfirmed(selectedItems);
  };

  const totalAmount = items
    .filter(item => item.isSelected)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const selectedCount = items.filter(item => item.isSelected).length;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ fontSize: 16, color: '#007AFF' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Receipt Items</Text>
        <View style={{ width: 50 }} />
      </View>

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
          OCR Confidence: {Math.round(ocrResult.confidence)}%
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Found {items.length} items • {selectedCount} selected
        </Text>
      </Card>

      <ScrollView style={{ flex: 1, marginBottom: 16 }}>
        {items.map((item) => (
          <Card key={item.id} style={{ marginBottom: 12, padding: 16 }}>
            {editingItem === item.id ? (
              <View>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Item name"
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    fontSize: 16,
                  }}
                />
                <TextInput
                  value={editPrice}
                  onChangeText={setEditPrice}
                  placeholder="Price"
                  keyboardType="numeric"
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    fontSize: 16,
                  }}
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button onPress={saveEdit} style={{ flex: 1 }}>
                    <Text style={{ color: 'white' }}>Save</Text>
                  </Button>
                  <Button onPress={cancelEdit} variant="outline" style={{ flex: 1 }}>
                    <Text>Cancel</Text>
                  </Button>
                </View>
              </View>
            ) : (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity 
                    onPress={() => toggleItemSelection(item.id)}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: item.isSelected ? '#007AFF' : '#ddd',
                      backgroundColor: item.isSelected ? '#007AFF' : 'transparent',
                      marginRight: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      {item.isSelected && (
                        <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                      )}
                    </View>
                    <Text style={{ 
                      fontSize: 16, 
                      textDecorationLine: item.isSelected ? 'none' : 'line-through',
                      color: item.isSelected ? '#000' : '#999',
                      flex: 1,
                    }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                    <TouchableOpacity onPress={() => startEditing(item)}>
                      <Text style={{ color: '#007AFF', fontSize: 14 }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Text style={{ color: '#FF3B30', fontSize: 14 }}>×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: '#666' }}>
                    ${item.price.toFixed(2)} each
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 14 }}>Qty:</Text>
                    <TouchableOpacity 
                      onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: '#f0f0f0',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text>-</Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', minWidth: 20, textAlign: 'center' }}>
                      {item.quantity}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: '#f0f0f0',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </Card>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <Button onPress={addManualItem} variant="outline" style={{ flex: 1 }}>
          <Text>Add Item</Text>
        </Button>
        <Button onPress={confirmItems} style={{ flex: 1 }}>
          <Text style={{ color: 'white' }}>
            Confirm (${totalAmount.toFixed(2)})
          </Text>
        </Button>
      </View>
    </View>
  );
}; 