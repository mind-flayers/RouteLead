import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { TextInput } from './TextInput';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface DateTimePickerProps {
  label: string;
  value: string;
  placeholder?: string;
  onPress: () => void; // Function to open the native date/time picker
  iconName?: 'calendar' | 'time';
  editable?: boolean;
}

export function DateTimePicker({
  label,
  value,
  placeholder,
  onPress,
  iconName = 'calendar',
  editable = true,
}: DateTimePickerProps) {
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
        disabled={!editable}
        activeOpacity={0.7}
      >
        <IconSymbol name={iconName === 'calendar' ? 'calendar' : 'timer'} size={20} color={iconColor} style={styles.icon} />
        <TextInput
          value={value}
          onChangeText={() => {}} // Read-only, so onChangeText does nothing
          placeholder={placeholder}
          editable={false} // Always false as it's controlled by onPress
          style={styles.input}
        />
      </TouchableOpacity>
    </View>
  );
}