import { Slot } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStorageAdapter, setApiBaseUrl } from '@schnittmuster/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Constants from 'expo-constants';
import "../global.css";

// Configure storage adapter for Native
setStorageAdapter({
  getItem: async (key) => AsyncStorage.getItem(key),
  setItem: async (key, value) => AsyncStorage.setItem(key, value),
  removeItem: async (key) => AsyncStorage.removeItem(key),
});

// Configure API URL
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0];

if (localhost) {
  setApiBaseUrl(`http://${localhost}:5001/api/v1`);
} else {
  // Fallback or production URL
  setApiBaseUrl('http://localhost:5001/api/v1');
}

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
