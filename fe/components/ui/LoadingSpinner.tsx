import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export function LoadingSpinner({ size = 'large', message }: LoadingSpinnerProps) {
  const primaryColor = useThemeColor({}, 'primary');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    message: {
      marginTop: 10,
      fontSize: 16,
      color: useThemeColor({}, 'text'),
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={primaryColor} />
      {message && <ThemedText style={styles.message}>{message}</ThemedText>}
    </View>
  );
}