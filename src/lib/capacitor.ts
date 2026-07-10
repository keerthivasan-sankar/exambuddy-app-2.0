import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Network } from '@capacitor/network';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';

export const initializeApp = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await SplashScreen.hide();
      
      // Set status bar to dark mode or light mode depending on theme
      // For now we can set it to a default
      await StatusBar.setStyle({ style: Style.Default });
      
      // Handle back button on Android
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });
      
    } catch (error) {
      console.error('Error initializing native plugins', error);
    }
  }
};

export const vibrate = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Ignore
    }
  }
};

export const shareAppContent = async (title: string, text: string, url: string) => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Share with buddies',
      });
      return true;
    } else if (navigator.share) {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error sharing', e);
    return false;
  }
};

export const getNetworkStatus = async () => {
  if (Capacitor.isNativePlatform()) {
    return await Network.getStatus();
  }
  return { connected: navigator.onLine, connectionType: 'unknown' };
};

export const addNetworkListener = (callback: (status: { connected: boolean }) => void) => {
  if (Capacitor.isNativePlatform()) {
    return Network.addListener('networkStatusChange', callback);
  } else {
    const handleOnline = () => callback({ connected: true });
    const handleOffline = () => callback({ connected: false });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return {
      remove: async () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }
};

export const takePicture = async () => {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt
    });
    return image.dataUrl;
  } catch (e) {
    console.error("Camera error", e);
    return null;
  }
};

export const setLocalPreference = async (key: string, value: string) => {
  await Preferences.set({ key, value });
};

export const getLocalPreference = async (key: string) => {
  const { value } = await Preferences.get({ key });
  return value;
};
