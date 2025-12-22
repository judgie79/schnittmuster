/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Theme definitions for the pattern app
export const AppThemes = {
  simple: {
    primary: '#007AFF',
    primaryDark: '#0051D5',
    primaryLight: '#5AC8FA',
    
    tileable: '#34C759',
    digital: '#FF9500',
    
    background: '#F2F2F7',
    cardBackground: '#FFFFFF',
    
    textPrimary: '#000000',
    textSecondary: '#8E8E93',
    textLight: '#FFFFFF',
    
    badgeGreen: '#34C759',
    badgeOrange: '#FF9500',
    badgeGray: '#C7C7CC',
    
    border: '#C6C6C8',
    shadow: '#000000',
  },
  
  modern: {
    primary: '#5A8A8F',
    primaryDark: '#4A7377',
    primaryLight: '#7BA5AA',
    
    tileable: '#4A7377',
    digital: '#D97E4A',
    
    background: '#F5F5F5',
    cardBackground: '#FFFFFF',
    
    textPrimary: '#2C3E50',
    textSecondary: '#7F8C8D',
    textLight: '#FFFFFF',
    
    badgeGreen: '#5A8A8F',
    badgeOrange: '#D97E4A',
    badgeGray: '#BDC3C7',
    
    border: '#E0E0E0',
    shadow: '#000000',
  },
};

// Active theme selection
let activeAppTheme: keyof typeof AppThemes = 'modern';

export const getAppTheme = () => AppThemes[activeAppTheme];

export const setAppTheme = (themeName: keyof typeof AppThemes) => {
  if (AppThemes[themeName]) {
    activeAppTheme = themeName;
    return true;
  }
  return false;
};

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/**
 * Update app.json splash screen and icon colors to match the modern theme
 */
export const updateAppConfigColors = (theme: keyof typeof AppThemes) => {
  const colors = AppThemes[theme];
  return {
    splashBackgroundColor: colors.background,
    androidIconBackgroundColor: colors.primaryLight,
    statusBarColor: colors.primary,
  };
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
