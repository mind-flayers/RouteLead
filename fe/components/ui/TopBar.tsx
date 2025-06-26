import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface TopBarProps {
  title: string;
  showBack?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ title, showBack = true }) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
      {showBack ? (
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ) : (
        <View className="w-10" /> // Placeholder for alignment
      )}
      <Text className="flex-1 text-center text-xl font-bold">{title}</Text>
      <View className="w-10" />{/* Placeholder for alignment */}
    </View>
  );
};

export default TopBar;
