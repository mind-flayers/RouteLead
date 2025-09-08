import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import TopBar from '../../../components/ui/TopBar';
import ProgressBar from '../../../components/ui/ProgressBar';
import { VerificationFlowService, DOCUMENT_TYPE_NAMES } from '../../../services/verificationFlowService';
import { VerificationApiService } from '../../../services/verificationApiService';
import { supabase } from '@/lib/supabase';

interface DocumentUpload {
  frontSide?: string;
  backSide?: string;
  document?: string;
}

const UploadPersonalDocs = () => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [driverLicense, setDriverLicense] = useState<DocumentUpload>({});
  const [nationalId, setNationalId] = useState<DocumentUpload>({});
  const [billingProof, setBillingProof] = useState<DocumentUpload>({});
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [verificationFlow] = useState(() => VerificationFlowService.getInstance());

  // Helper functions for date formatting
  const formatDateForDisplay = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForBackend = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || expiryDate;
    setShowDatePicker(Platform.OS === 'ios');
    setExpiryDate(currentDate);
    setLicenseExpiry(formatDateForDisplay(currentDate));
  };

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          // Initialize verification flow
          await verificationFlow.initializeFlow(user.id);
          
          // Check if documents already exist and populate UI
          const flowState = verificationFlow.getFlowState();
          
          // Populate existing documents
          const existingNationalId = flowState.documents.find(doc => doc.documentType === 'NATIONAL_ID');
          const existingDriversLicense = flowState.documents.find(doc => doc.documentType === 'DRIVERS_LICENSE');
          
          if (existingNationalId && existingNationalId.localUri) {
            setNationalId(prev => ({ ...prev, frontSide: existingNationalId.localUri }));
          }
          
          if (existingDriversLicense && existingDriversLicense.localUri) {
            setDriverLicense(prev => ({ ...prev, frontSide: existingDriversLicense.localUri }));
          }
        }
      } catch (error) {
        console.error('Error initializing component:', error);
        Alert.alert('Error', 'Failed to initialize verification. Please try again.');
      }
    };

    initializeComponent();
  }, []);

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

  const uploadDocument = async (userId: string, imageUri: string, documentType: string, expiryDate?: string) => {
    const fileName = `${documentType}_${userId}_${Date.now()}.jpg`;
    
    // Create file object compatible with VerificationFlowService
    const fileData = {
      uri: imageUri,
      type: 'image/jpeg',
      name: fileName,
    };

    // Upload using VerificationFlowService (handles Supabase Storage)
    return await verificationFlow.uploadDocument(userId, fileData, documentType, expiryDate);
  };

  const validateAndContinue = async () => {
    // Validation checks
    if (!driverLicense.frontSide) {
      Alert.alert('Missing Documents', 'Please upload your driving license.');
      return;
    }
    if (!nationalId.frontSide) {
      Alert.alert('Missing Documents', 'Please upload your national ID card.');
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

    if (!userId) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    try {
      setIsUploading(true);

      // Upload all documents using VerificationFlowService
      const uploadPromises = [];

      // Upload driver license document (correct enum: DRIVERS_LICENSE)
      if (driverLicense.frontSide) {
        uploadPromises.push(
          uploadDocument(userId, driverLicense.frontSide, 'DRIVERS_LICENSE', formatDateForBackend(expiryDate))
        );
      }
      
      // Upload national ID document (correct enum: NATIONAL_ID)
      if (nationalId.frontSide) {
        uploadPromises.push(
          uploadDocument(userId, nationalId.frontSide, 'NATIONAL_ID')
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // TODO: Store license details locally for now - will fix profile update later
      await AsyncStorage.setItem('driverLicenseNumber', licenseNumber.trim());
      await AsyncStorage.setItem('licenseExpiryDate', formatDateForBackend(expiryDate));

      Alert.alert(
        'Success!', 
        'Personal documents uploaded successfully!',
        [{ text: 'Continue', onPress: () => router.push('/pages/driver/SelectVehicleType') }]
      );
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Failed to upload documents. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
          <TouchableOpacity
            className="border border-gray-300 rounded-lg p-3 flex-row items-center justify-between"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className={`text-gray-700 ${!licenseExpiry ? 'text-gray-400' : ''}`}>
              {licenseExpiry || 'Select Expiry Date (DD/MM/YYYY)'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={expiryDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
              maximumDate={new Date(2050, 11, 31)}
            />
          )}
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
          onPress={validateAndContinue}
          className={`flex-1 ml-2 py-3 rounded-lg items-center ${
            isUploading ? 'bg-gray-400' : 'bg-orange-500'
          }`}
          disabled={isUploading}
        >
          <Text className="text-white text-lg font-bold">
            {isUploading ? 'Uploading...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UploadPersonalDocs;
