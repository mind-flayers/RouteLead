import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Complaints() {
  const router = useRouter();
  const [complaintType, setComplaintType] = useState('');
  const [description, setDescription] = useState('');
  const [orderNumber, setOrderNumber] = useState('123456'); // Default order number

  const complaintTypes = [
    { id: 'delivery_delay', label: 'Delivery Delay', icon: 'time-outline' },
    { id: 'damaged_package', label: 'Damaged Package', icon: 'warning-outline' },
    { id: 'wrong_item', label: 'Wrong Item Delivered', icon: 'close-circle-outline' },
    { id: 'driver_behavior', label: 'Driver Behavior', icon: 'person-outline' },
    { id: 'service_quality', label: 'Service Quality', icon: 'star-outline' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
  ];

  const handleSubmitComplaint = () => {
    if (!complaintType) {
      Alert.alert('Error', 'Please select a complaint type');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    // Here you would typically send the complaint to your backend
    console.log('Submitting complaint:', {
      orderNumber,
      complaintType,
      description,
      timestamp: new Date().toISOString()
    });

    Alert.alert(
      'Complaint Submitted',
      'Your complaint has been submitted successfully. We will review it and get back to you soon.',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#F6F6FA]">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-10 pb-4 bg-white shadow">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Complaint</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Order Information */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-[#0D47A1] mb-2">Order Information</Text>
          <Text className="text-gray-600">Order #: {orderNumber}</Text>
          <Text className="text-gray-600">Date: July 20, 2025</Text>
          <Text className="text-gray-600">Driver: Nimal Perera</Text>
        </View>

        {/* Complaint Type Selection */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-[#0D47A1] mb-3">Complaint Type</Text>
          <View className="space-y-2">
            {complaintTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                className={`flex-row items-center p-3 rounded-lg border ${
                  complaintType === type.id 
                    ? 'border-[#FF8C00] bg-[#FFF8E1]' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                onPress={() => setComplaintType(type.id)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={20} 
                  color={complaintType === type.id ? '#FF8C00' : '#666'} 
                />
                <Text className={`ml-3 flex-1 ${
                  complaintType === type.id ? 'text-[#FF8C00] font-semibold' : 'text-gray-700'
                }`}>
                  {type.label}
                </Text>
                {complaintType === type.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#FF8C00" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-[#0D47A1] mb-3">Description</Text>
          <TextInput
            className="border border-gray-200 rounded-lg p-3 min-h-[120px] text-gray-700"
            placeholder="Please describe your complaint in detail..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            style={styles.textInput}
          />
          <Text className="text-xs text-gray-500 mt-2">
            {description.length}/500 characters
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-[#FF8C00] mx-2 py-4 rounded-lg flex-row items-center justify-center mb-6"
          onPress={handleSubmitComplaint}
        >
          <Ionicons name="send-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold text-lg ml-2">Submit Complaint</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24,
  },
  textInput: {
    fontSize: 16,
  },
});
