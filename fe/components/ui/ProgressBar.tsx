import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProgressBarProps {
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Face Photo' },
    { id: 2, name: 'Personal Document' },
    { id: 3, name: 'Vehicle Type' },
    { id: 4, name: 'Vehicle Documents' },
  ];

  return (
    <View className="flex-row justify-between items-start p-4 bg-white border-b border-gray-200">
      {steps.map((step, index) => (
        <View key={step.id} className="flex-1 items-center px-1">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              currentStep === step.id
                ? 'bg-orange-500'
                : currentStep > step.id
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          >
            {currentStep > step.id ? (
              <Ionicons name="checkmark" size={20} color="white" />
            ) : (
              <Text className="text-white font-bold text-sm">{step.id}</Text>
            )}
          </View>
          <Text
            className={`text-xs mt-2 text-center leading-3 ${
              currentStep === step.id ? 'text-orange-500 font-bold' : 'text-gray-600'
            }`}
            numberOfLines={2}
          >
            {step.name}
          </Text>
          {/* Connection line */}
          {index < steps.length - 1 && (
            <View className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-300 -z-10" style={{ transform: [{ translateX: 16 }] }} />
          )}
        </View>
      ))}
    </View>
  );
};

export default ProgressBar;
