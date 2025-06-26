import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
              <Text style={styles.stepNumber}>{step.id}</Text>
            )}
          </View>
          <Text
            style={[
              styles.stepName,
              currentStep === step.id ? styles.activeStepName : styles.inactiveStepName
            ]}
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

const styles = StyleSheet.create({
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepName: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 12,
  },
  activeStepName: {
    color: '#F97316',
    fontWeight: 'bold',
  },
  inactiveStepName: {
    color: '#6B7280',
  },
});

export default ProgressBar;
