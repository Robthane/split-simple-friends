import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createWorker } from 'tesseract.js';
import { Button } from './ui/button';

interface OCRResult {
  text: string;
  confidence: number;
  items: ReceiptItem[];
}

interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

interface OCRServiceProps {
  onOCRComplete: (result: OCRResult) => void;
  onError: (error: string) => void;
}

export const OCRService: React.FC<OCRServiceProps> = ({ onOCRComplete, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to use this feature.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      onError('Failed to pick image');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to use this feature.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      onError('Failed to take photo');
    }
  };

  const processImage = async (imageUri: string) => {
    setIsProcessing(true);
    
    try {
      const worker = await createWorker('eng');
      
      // Convert image URI to base64 or blob for Tesseract
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const { data } = await worker.recognize(blob);
      
      await worker.terminate();

      const extractedText = data.text;
      const confidence = data.confidence;
      
      // Parse receipt items from extracted text
      const items = parseReceiptItems(extractedText);
      
      const result: OCRResult = {
        text: extractedText,
        confidence,
        items,
      };

      onOCRComplete(result);
    } catch (error) {
      onError('Failed to process image with OCR');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseReceiptItems = (text: string): ReceiptItem[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const items: ReceiptItem[] = [];
    
    // Common patterns for receipt items
    const pricePattern = /\$?\d+\.\d{2}/;
    const itemPattern = /^(.+?)\s+\$?\d+\.\d{2}$/;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Skip header/footer lines
      if (trimmedLine.toLowerCase().includes('total') || 
          trimmedLine.toLowerCase().includes('subtotal') ||
          trimmedLine.toLowerCase().includes('tax') ||
          trimmedLine.toLowerCase().includes('change') ||
          trimmedLine.toLowerCase().includes('cash') ||
          trimmedLine.toLowerCase().includes('card')) {
        return;
      }
      
      // Try to match item pattern
      const match = trimmedLine.match(itemPattern);
      if (match) {
        const itemName = match[1].trim();
        const priceMatch = trimmedLine.match(pricePattern);
        
        if (priceMatch) {
          const price = parseFloat(priceMatch[0].replace('$', ''));
          
          // Only add if it looks like a reasonable item
          if (itemName.length > 1 && price > 0 && price < 1000) {
            items.push({
              name: itemName,
              price,
            });
          }
        }
      }
    });
    
    return items;
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Receipt OCR Scanner
      </Text>
      
      {selectedImage && (
        <View style={{ marginBottom: 16 }}>
          <Image 
            source={{ uri: selectedImage }} 
            style={{ width: '100%', height: 200, borderRadius: 8 }}
            resizeMode="contain"
          />
          <TouchableOpacity 
            onPress={clearImage}
            style={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              borderRadius: 15,
              width: 30,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 16 }}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {isProcessing && (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Processing receipt...</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button 
          onPress={takePhoto}
          disabled={isProcessing}
          style={{ flex: 1 }}
        >
          <Text style={{ color: 'white' }}>Take Photo</Text>
        </Button>
        
        <Button 
          onPress={pickImage}
          disabled={isProcessing}
          style={{ flex: 1 }}
        >
          <Text style={{ color: 'white' }}>Pick Image</Text>
        </Button>
      </View>
    </View>
  );
}; 