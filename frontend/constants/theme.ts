/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 * apologies this is being all done, even though it 
 * wasn't explicity mentioned in the certain assessments (i.e. 
 * revised project proposal, and so on), but our group wanted 
 * to add all of these features, so that it can helpful for 
 * all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
 * "CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#111827',
    background: '#FFFFFF',
    card: '#f3f4f6',
    border: '#D1D5DB', // 1,000% Clear Visibility Masterpiece Gray!!!
    tint: '#6366F1',
    secondary: '#4b5563',
    tabIconDefault: '#9ca3af',
    tabIconSelected: '#6366F1',
    gradient: ["#b7d9ff", "#ffffff"],
    box: "#eef5ff",
    success: "#10B981",
    error: "#EF4444",
    neutral: "#6B7280",
  },
  dark: {
    text: '#F9FAFB',
    background: '#111827',
    card: '#1F2937',
    border: '#4B5563', // 1,000% Clear Visibility Masterpiece Gray!!!
    tint: '#818CF8',
    secondary: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#818CF8',
    gradient: ["#0f172a", "#1e293b"],
    box: "#1e293b",
    success: "#34D399",
    error: "#F87171",
    neutral: "#9CA3AF",
  },
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
