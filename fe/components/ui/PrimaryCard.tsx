import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useColorScheme } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface PrimaryCardProps {
  children: React.ReactNode;
  title?: string;
  style?: object;
  className?: string; // Add className prop
}

const PrimaryCard: React.FC<PrimaryCardProps> = ({ children, title, style, className }) => {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({ light: '#FF8C00', dark: '#FF8C00' }, 'tint'); // Orange border

  return (
    <View style={[styles.card, { borderColor: tintColor }, style]} className={className}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
});

export default PrimaryCard;
