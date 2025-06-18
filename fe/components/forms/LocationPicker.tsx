import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from './TextInput';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface LocationPickerProps {
  label: string;
  value: string;
  placeholder?: string;
  onSelectLocation: (location: string) => void;
  onPress?: () => void; // Optional prop to handle custom press behavior (e.g., open a map modal)
  editable?: boolean;
}

export function LocationPicker({
  label,
  value,
  placeholder,
  onSelectLocation,
  onPress,
  editable = true,
}: LocationPickerProps) {
  const iconColor = useThemeColor({}, 'icon');

  const styles = StyleSheet.create({
    container: {
      marginBottom: 15,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: useThemeColor({}, 'border'),
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: useThemeColor({}, 'background'),
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: useThemeColor({}, 'text'),
      paddingVertical: 0, // Override default TextInput padding
    },
    icon: {
      marginRight: 10,
    },
    labelStyle: {
      fontSize: 14,
      marginBottom: 5,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <ThemedText style={styles.labelStyle}>{label}</ThemedText>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={onPress}
        disabled={!onPress || !editable}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <IconSymbol name="location" size={20} color={iconColor} style={styles.icon} />
        <TextInput
          value={value}
          onChangeText={onSelectLocation}
          placeholder={placeholder}
          editable={editable && !onPress} // If onPress is provided, make TextInput non-editable
          style={styles.input}
        />
      </TouchableOpacity>
    </View>
  );
}