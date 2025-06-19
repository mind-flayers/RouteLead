import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from './TextInput';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onFilterPress,
}: SearchBarProps) {
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      paddingHorizontal: 15,
      backgroundColor: backgroundColor,
      marginBottom: 15,
    },
    input: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 16,
      // The TextInput component already handles color, so no need to set it here
    },
    icon: {
      marginRight: 10,
    },
    filterButton: {
      marginLeft: 10,
      padding: 5,
    },
  });

  return (
    <View style={styles.container}>
      <IconSymbol name="magnifyingglass" size={20} color={iconColor} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
      />
      {onFilterPress && (
        <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
          <IconSymbol name="line.horizontal.3.decrease.circle" size={24} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}