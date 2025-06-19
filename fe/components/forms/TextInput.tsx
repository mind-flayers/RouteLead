import React from 'react';
import { TextInput as RNTextInput, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  style?: TextStyle;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
}

export function TextInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  style,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  error,
}: TextInputProps) {
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const errorColor = useThemeColor({}, 'error');
  const placeholderColor = useThemeColor({}, 'tabIconDefault'); // Using tabIconDefault for a subtle placeholder color

  const styles = StyleSheet.create({
    container: {
      marginBottom: 15,
    },
    label: {
      fontSize: 14,
      marginBottom: 5,
      fontWeight: 'bold',
    },
    input: {
      borderWidth: 1,
      borderColor: error ? errorColor : borderColor,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 10,
      fontSize: 16,
      color: textColor,
      backgroundColor: useThemeColor({}, 'background'),
    },
    errorText: {
      fontSize: 12,
      color: errorColor,
      marginTop: 5,
    },
  });

  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <RNTextInput
        style={[styles.input, style]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
}