import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface PWAInstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onInstall, onDismiss }) => {
  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-white shadow-lg border-2 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-800">Install EasyBill</p>
              <p className="text-sm text-gray-600">Add to home screen for quick access</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={onInstall}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Download className="h-4 w-4 mr-1" />
              Install
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

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  return { showInstallPrompt, installApp, dismissInstallPrompt };
}; 