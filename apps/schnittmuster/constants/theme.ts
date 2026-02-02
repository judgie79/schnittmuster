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

  pattern: {
    // Primary colors - the teal/petrol color scheme
    primary: '#5A8A8F',
    primaryDark: '#4A7377',
    primaryLight: '#6B9BA0',
    primaryMuted: '#7EACB1',
    
    // Badge/Tag colors
    tileable: '#5A8A8F', // Teal badge
    digital: '#E89A6B', // Orange badge
    seamless: '#95A5A6', // Gray badge
    
    // Background colors
    background: '#E8EDED', // Light teal-gray background
    cardBackground: '#FFFFFF',
    headerBackground: '#5A8A8F',
    
    // Text colors
    textPrimary: '#2C3E50',
    textSecondary: '#7F8C8D',
    textMuted: '#95A5A6',
    textLight: '#FFFFFF',
    textOnPrimary: '#FFFFFF',
    
    // Badge colors
    badgeTileable: '#5A8A8F',
    badgeDigital: '#E89A6B',
    badgeSeamless: '#95A5A6',
    
    // UI elements
    border: '#D0D8D8',
    borderLight: '#E5E9E9',
    inputBackground: '#FFFFFF',
    inputBorder: '#D0D8D8',
    
    // Shadows
    shadow: '#000000',
    shadowLight: 'rgba(0, 0, 0, 0.08)',
    
    // Toggle/Switch
    toggleActive: '#5A8A8F',
    toggleInactive: '#D0D8D8',
    
    // Button colors
    buttonPrimary: '#5A8A8F',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: '#E8EDED',
    buttonSecondaryText: '#5A8A8F',
    
    // Icon colors
    iconPrimary: '#5A8A8F',
    iconSecondary: '#7F8C8D',
    iconLight: '#FFFFFF',
    
    // Status colors
    success: '#5A8A8F',
    warning: '#E89A6B',
    error: '#E74C3C',
    info: '#6B9BA0',
  },
  
  // Modern alternative theme
  modern2: {
    primary: '#5A8A8F',
    primaryDark: '#4A7377',
    primaryLight: '#7BA5AA',
    
    tileable: '#4A7377',
    digital: '#D97E4A',
    seamless: '#BDC3C7',
    
    background: '#F5F5F5',
    cardBackground: '#FFFFFF',
    headerBackground: '#5A8A8F',
    
    textPrimary: '#2C3E50',
    textSecondary: '#7F8C8D',
    textMuted: '#95A5A6',
    textLight: '#FFFFFF',
    textOnPrimary: '#FFFFFF',
    
    badgeTileable: '#5A8A8F',
    badgeDigital: '#D97E4A',
    badgeSeamless: '#BDC3C7',
    
    border: '#E0E0E0',
    borderLight: '#EEEEEE',
    inputBackground: '#FFFFFF',
    inputBorder: '#E0E0E0',
    
    shadow: '#000000',
    shadowLight: 'rgba(0, 0, 0, 0.1)',
    
    toggleActive: '#5A8A8F',
    toggleInactive: '#BDC3C7',
    
    buttonPrimary: '#5A8A8F',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: '#F5F5F5',
    buttonSecondaryText: '#5A8A8F',
    
    iconPrimary: '#5A8A8F',
    iconSecondary: '#7F8C8D',
    iconLight: '#FFFFFF',
    
    success: '#5A8A8F',
    warning: '#D97E4A',
    error: '#E74C3C',
    info: '#7BA5AA',
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

const tintColorLight2 = '#5A8A8F';
const tintColorDark2 = '#fff';

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

  light2: {
    text: '#2C3E50',
    background: '#E8EDED',
    tint: tintColorLight2,
    icon: '#7F8C8D',
    tabIconDefault: '#7F8C8D',
    tabIconSelected: tintColorLight2,
  },
  dark2: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark2,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark2,
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

// Typography scale
export const Typography = {
  // Headers
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  
  // Small text
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  smallBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  
  // Caption/Helper text
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  
  // Badge text
  badge: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
  },
};

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  full: 9999,
};

// Shadow definitions
export const Shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
  }),
  
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
  }),
  
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
  }),
};
