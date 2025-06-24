/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors | keyof typeof Colors.light
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else if (typeof Colors[colorName as keyof typeof Colors] === 'string') {
    // If the colorName exists directly on Colors and is a string (e.g., 'primary', 'secondary', 'error')
    return Colors[colorName as keyof typeof Colors] as string;
  } else {
    // Fallback to theme-specific colors
    return Colors[theme][colorName as keyof typeof Colors.light];
  }
}
