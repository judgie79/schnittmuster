import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { setApiBaseUrl, setStorageAdapter } from '@schnittmuster/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAppTheme } from '@/constants/theme';

const queryClient = new QueryClient();

// Configure shared storage + API base URL for the core SDK.
setStorageAdapter({
  getItem: async (key) => AsyncStorage.getItem(key),
  setItem: async (key, value) => AsyncStorage.setItem(key, value),
  removeItem: async (key) => AsyncStorage.removeItem(key),
});

const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
const apiBaseUrl = debuggerHost
  ? `http://${debuggerHost}:5001/api/v1`
  : 'http://localhost:5001/api/v1';

setApiBaseUrl(apiBaseUrl);

// Create custom navigation themes using our app theme
const appTheme = getAppTheme();

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: appTheme.primary,
    background: appTheme.background,
    card: appTheme.cardBackground,
    text: appTheme.textPrimary,
    border: appTheme.border,
    notification: appTheme.primaryDark,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: appTheme.primaryLight,
    background: appTheme.textPrimary,
    card: appTheme.primaryDark,
    text: appTheme.textLight,
    border: appTheme.border,
    notification: appTheme.primary,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="patterns/new" options={{ presentation: 'card' }} />
            <Stack.Screen name="patterns/[patternId]" options={{ presentation: 'card' }} />
            <Stack.Screen name="patterns/[patternId]/edit" options={{ presentation: 'card' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
