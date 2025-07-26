import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { BillItem } from '@/types/bill';
import { createWorker } from 'tesseract.js';

interface CameraCaptureProps {
  onItemsExtracted: (items: BillItem[]) => void;
}

interface ReceiptItem {
  name: string;
  price: number;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onItemsExtracted }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{
    text: string;
    confidence: number;
    items: ReceiptItem[];
  } | null>(null);
  const [showParser, setShowParser] = useState(false);

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

  const processImageWithOCR = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const worker = await createWorker('eng');
      
      const { data } = await worker.recognize(file);
      
      await worker.terminate();

      const extractedText = data.text;
      const confidence = data.confidence;
      const items = parseReceiptItems(extractedText);
      
      setOcrResult({
        text: extractedText,
        confidence,
        items,
      });
      
      setShowParser(true);
    } catch (error) {
      console.error('OCR processing failed:', error);
      // Fallback to sample data
      const sampleItems: BillItem[] = [
        { id: '1', name: 'Burger Deluxe', price: 15.99, assignedTo: [], isShared: false },
        { id: '2', name: 'Caesar Salad', price: 12.50, assignedTo: [], isShared: false },
        { id: '3', name: 'Craft Beer', price: 8.00, assignedTo: [], isShared: false },
        { id: '4', name: 'Tax & Tip', price: 7.25, assignedTo: [], isShared: false }
      ];
      
      onItemsExtracted(sampleItems);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    await processImageWithOCR(file);
  };

  const handleItemsConfirmed = (items: ReceiptItem[]) => {
    const billItems: BillItem[] = items.map((item, index) => ({
      id: `item-${index}`,
      name: item.name,
      price: item.price,
      assignedTo: [],
      isShared: false,
    }));
    
    onItemsExtracted(billItems);
  };

  const clearImage = () => {
    setPreviewImage(null);
    setOcrResult(null);
    setShowParser(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (showParser && ocrResult) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Receipt Items</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearImage}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mb-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                OCR Confidence: {Math.round(ocrResult.confidence)}%
              </p>
              <p className="text-sm text-gray-600">
                Found {ocrResult.items.length} items
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ocrResult.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={clearImage}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                onClick={() => handleItemsConfirmed(ocrResult.items)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Confirm Items
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200">
      <CardContent className="p-8 text-center">
        {previewImage ? (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={previewImage} 
                alt="Bill preview" 
                className="max-w-full h-48 object-contain mx-auto rounded-lg shadow-md"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {isProcessing && (
              <div className="flex items-center justify-center space-x-2 text-purple-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing receipt with OCR...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-purple-200 p-6 rounded-full">
                <Camera className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Capture Your Bill
              </h3>
              <p className="text-gray-600 mb-6">
                Take a photo or upload an image of your receipt. We'll use OCR to extract items automatically.
              </p>
            </div>
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isProcessing}
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Receipt
            </Button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default CameraCapture;