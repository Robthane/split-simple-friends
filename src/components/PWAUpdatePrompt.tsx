import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { RefreshCw, X } from 'lucide-react';

interface PWAUpdatePromptProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({ onUpdate, onDismiss }) => {
  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-white shadow-lg border-2 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-800">New version available</p>
              <p className="text-sm text-gray-600">Update to get the latest features</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={onUpdate}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Update
            </Button>
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const usePWAUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const updateApp = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return { updateAvailable, updateApp };
}; 