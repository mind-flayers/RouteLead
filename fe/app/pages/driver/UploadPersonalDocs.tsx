import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import TopBar from '../../../components/ui/TopBar';
import ProgressBar from '../../../components/ui/ProgressBar';

interface DocumentUpload {
  frontSide?: string;
  backSide?: string;
  document?: string;
}

const UploadPersonalDocs = () => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [driverLicense, setDriverLicense] = useState<DocumentUpload>({});
  const [nationalId, setNationalId] = useState<DocumentUpload>({});
  const [billingProof, setBillingProof] = useState<DocumentUpload>({});

  const pickDocument = async (
    docType: 'driverLicense' | 'nationalId' | 'billingProof',
    side?: 'frontSide' | 'backSide' | 'document'
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permissions are required to upload documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      if (docType === 'driverLicense') {
        setDriverLicense(prev => ({ ...prev, [side!]: imageUri }));
      } else if (docType === 'nationalId') {
        setNationalId(prev => ({ ...prev, [side!]: imageUri }));
      } else if (docType === 'billingProof') {
        setBillingProof(prev => ({ ...prev, [side!]: imageUri }));
      }
    }
  };

  const validateAndContinue = () => {
    if (!driverLicense.frontSide || !driverLicense.backSide) {
      Alert.alert('Missing Documents', 'Please upload both sides of your driving license.');
      return;
    }
    if (!nationalId.frontSide || !nationalId.backSide) {
      Alert.alert('Missing Documents', 'Please upload both sides of your national ID card.');
      return;
    }
    if (!licenseNumber.trim()) {
      Alert.alert('Missing Information', 'Please enter your driving license number.');
      return;
    }
    if (!licenseExpiry.trim()) {
      Alert.alert('Missing Information', 'Please enter your license expiry date.');
      return;
    }
    
    router.push('/pages/driver/SelectVehicleType');
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <TopBar title="Upload Personal Documents" />
      <ProgressBar currentStep={2} />

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <Text className="text-xl font-bold mb-2">Guidelines for Document Upload</Text>
          <Text className="text-gray-600 mb-4">
            Please upload clear, legible copies of your documents. Ensure all four corners are visible and details are readable.
          </Text>

          <View className="mb-2">
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text className="ml-2 text-gray-700">
                <Text className="font-bold">High-resolution</Text> scans or photos are preferred for clarity.
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text className="ml-2 text-gray-700">
                Ensure <Text className="font-bold">all text is readable</Text> and no glare obscures information.
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text className="ml-2 text-gray-700">
                Maximum <Text className="font-bold">file size</Text> per document is 10 MB.
              </Text>
            </View>
            <Text className="ml-7 text-gray-500 text-sm">Supported formats: PDF, JPG, PNG.</Text>
          </View>
        </View>

        <Text className="text-lg font-bold mb-4">Required Documents</Text>

        {/* Driver's License */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="file-document-outline" size={24} color="black" />
              <Text className="ml-2 text-lg font-bold">Driver's License</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
          </View>
          <Text className="text-gray-600 mb-4">
            Upload clear front and back images of your valid driving license.
          </Text>
          <TouchableOpacity 
            className={`flex-row items-center justify-center border rounded-lg py-3 mb-2 ${
              driverLicense.frontSide ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onPress={() => pickDocument('driverLicense', 'frontSide')}
          >
            <Ionicons 
              name={driverLicense.frontSide ? "checkmark-circle" : "cloud-upload-outline"} 
              size={20} 
              color={driverLicense.frontSide ? "#22C55E" : "#3B82F6"} 
            />
            <Text className={`ml-2 font-bold ${
              driverLicense.frontSide ? 'text-green-600' : 'text-blue-600'
            }`}>
              {driverLicense.frontSide ? 'Front Side Uploaded ✓' : 'Front Side of Driving Licence'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-row items-center justify-center border rounded-lg py-3 mb-4 ${
              driverLicense.backSide ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onPress={() => pickDocument('driverLicense', 'backSide')}
          >
            <Ionicons 
              name={driverLicense.backSide ? "checkmark-circle" : "cloud-upload-outline"} 
              size={20} 
              color={driverLicense.backSide ? "#22C55E" : "#3B82F6"} 
            />
            <Text className={`ml-2 font-bold ${
              driverLicense.backSide ? 'text-green-600' : 'text-blue-600'
            }`}>
              {driverLicense.backSide ? 'Back Side Uploaded ✓' : 'Back Side of Driving Licence'}
            </Text>
          </TouchableOpacity>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-2 text-gray-700"
            placeholder="Enter Driving Licence Number"
            placeholderTextColor="#9CA3AF"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
          />
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-gray-700"
            placeholder="Select Expiry Date (DD/MM/YYYY)"
            placeholderTextColor="#9CA3AF"
            value={licenseExpiry}
            onChangeText={setLicenseExpiry}
          />
        </View>

        {/* National ID Card */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="file-document-outline" size={24} color="black" />
              <Text className="ml-2 text-lg font-bold">National ID Card</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
          </View>
          <Text className="text-gray-600 mb-4">
            Upload clear front and back images of your NIC.
          </Text>
          <TouchableOpacity 
            className={`flex-row items-center justify-center border rounded-lg py-3 mb-2 ${
              nationalId.frontSide ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onPress={() => pickDocument('nationalId', 'frontSide')}
          >
            <Ionicons 
              name={nationalId.frontSide ? "checkmark-circle" : "cloud-upload-outline"} 
              size={20} 
              color={nationalId.frontSide ? "#22C55E" : "#3B82F6"} 
            />
            <Text className={`ml-2 font-bold ${
              nationalId.frontSide ? 'text-green-600' : 'text-blue-600'
            }`}>
              {nationalId.frontSide ? 'Front Side Uploaded ✓' : 'Front Side of NIC'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-row items-center justify-center border rounded-lg py-3 ${
              nationalId.backSide ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onPress={() => pickDocument('nationalId', 'backSide')}
          >
            <Ionicons 
              name={nationalId.backSide ? "checkmark-circle" : "cloud-upload-outline"} 
              size={20} 
              color={nationalId.backSide ? "#22C55E" : "#3B82F6"} 
            />
            <Text className={`ml-2 font-bold ${
              nationalId.backSide ? 'text-green-600' : 'text-blue-600'
            }`}>
              {nationalId.backSide ? 'Back Side Uploaded ✓' : 'Back Side of NIC'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Billing Proof (optional) */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="file-document-outline" size={24} color="black" />
              <Text className="ml-2 text-lg font-bold">Billing Proof (optional)</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
          </View>
          <Text className="text-gray-600 mb-4">
            Submit any of your utility bill(water, electricity, salary slips, bank statement) to confirm your address.
          </Text>
          <TouchableOpacity 
            className={`flex-row items-center justify-center border rounded-lg py-3 ${
              billingProof.document ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onPress={() => pickDocument('billingProof', 'document')}
          >
            <Ionicons 
              name={billingProof.document ? "checkmark-circle" : "cloud-upload-outline"} 
              size={20} 
              color={billingProof.document ? "#22C55E" : "#3B82F6"} 
            />
            <Text className={`ml-2 font-bold ${
              billingProof.document ? 'text-green-600' : 'text-blue-600'
            }`}>
              {billingProof.document ? 'Document Uploaded ✓' : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row justify-between p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleBackPress}
          className="flex-1 mr-2 py-3 rounded-lg items-center border border-gray-300"
        >
          <Text className="text-gray-700 text-lg font-bold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/pages/driver/SelectVehicleType')}
          // onPress={handleBackPress}
          className="flex-1 ml-2 bg-orange-500 py-3 rounded-lg items-center"
        >
          <Text className="text-white text-lg font-bold">Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UploadPersonalDocs;
