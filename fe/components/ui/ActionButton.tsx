import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';

interface ActionButtonProps {
  onPress: () => void;
  title: string;
  type?: 'primary' | 'secondary' | 'error';
  isLoading?: boolean;
  disabled?: boolean;
}

export function ActionButton({
  onPress,
  title,
  type = 'primary',
  isLoading = false,
  disabled = false,
}: ActionButtonProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const dangerColor = useThemeColor({}, 'error');
  const textColor = useThemeColor({}, 'text');
  const buttonBackgroundColor = type === 'primary' ? primaryColor : type === 'error' ? dangerColor : 'transparent';
  const buttonBorderColor = type === 'secondary' ? secondaryColor : 'transparent';

  const styles = StyleSheet.create({
    button: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled || isLoading ? 0.6 : 1,
      backgroundColor: buttonBackgroundColor,
      borderWidth: type === 'secondary' ? 1 : 0,
      borderColor: buttonBorderColor,
    },
    buttonText: {
      color: type === 'primary' || type === 'error' ? '#FFFFFF' : textColor,
      fontWeight: 'bold',
      fontSize: 16,
    },
    spinner: {
      marginLeft: 10,
    },
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={type === 'primary' || type === 'error' ? '#FFFFFF' : primaryColor} />
      ) : (
        <ThemedText style={styles.buttonText}>{title}</ThemedText>
      )}
    </TouchableOpacity>
  );
}