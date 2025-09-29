import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Animated, Platform, Image } from 'react-native';
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
  
  // Validation states
  const [licenseNumberError, setLicenseNumberError] = useState('');
  const [expiryDateError, setExpiryDateError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Validation Functions
  const validateImageFile = async (imageUri: string): Promise<string | null> => {
    try {
      // Get image dimensions
      return new Promise((resolve) => {
        Image.getSize(
          imageUri,
          (width, height) => {
            // Check minimum dimensions (should be at least 300x300 for readability)
            if (width < 300 || height < 300) {
              resolve('Image resolution too low. Minimum 300x300 pixels required.');
              return;
            }

            // Check maximum dimensions (prevent extremely large files)
            if (width > 4000 || height > 4000) {
              resolve('Image resolution too high. Maximum 4000x4000 pixels allowed.');
              return;
            }

            // Check aspect ratio (should be somewhat rectangular, not too extreme)
            const aspectRatio = width / height;
            if (aspectRatio < 0.5 || aspectRatio > 3.0) {
              resolve('Invalid image aspect ratio. Please use a more standard photo format.');
              return;
            }

            resolve(null); // No errors
          },
          (error) => {
            console.error('Error getting image size:', error);
            resolve('Unable to validate image. Please try a different photo.');
          }
        );
      });
    } catch (error) {
      console.error('Image validation error:', error);
      return 'Error validating image. Please try again.';
    }
  };

  const validateLicenseNumber = (licenseNum: string): string | null => {
    if (!licenseNum || licenseNum.trim().length === 0) {
      return 'License number is required';
    }

    const trimmed = licenseNum.trim().toUpperCase();

    // Check minimum length
    if (trimmed.length < 5) {
      return 'License number must be at least 5 characters';
    }

    // Check maximum length
    if (trimmed.length > 20) {
      return 'License number cannot exceed 20 characters';
    }

    // Check for valid characters (alphanumeric, hyphens, spaces)
    const validPattern = /^[A-Z0-9\s\-]+$/;
    if (!validPattern.test(trimmed)) {
      return 'License number can only contain letters, numbers, spaces, and hyphens';
    }

    // Check for at least one number (most license formats include numbers)
    if (!/\d/.test(trimmed)) {
      return 'License number must contain at least one number';
    }

    // Check for at least one letter (most license formats include letters)
    if (!/[A-Z]/.test(trimmed)) {
      return 'License number must contain at least one letter';
    }

    // Common suspicious patterns
    const suspiciousPatterns = [
      /^(.)\1{4,}$/, // Repeated characters (AAAAA)
      /^(123|ABC|000|111|AAA)/i, // Common test patterns
      /^(TEST|SAMPLE|DEMO|FAKE)/i, // Test keywords
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(trimmed)) {
        return 'Please enter a valid license number';
      }
    }

    return null; // Valid
  };

  const validateExpiryDate = (date: Date): string | null => {
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    
    const tenYearsFromNow = new Date();
    tenYearsFromNow.setFullYear(today.getFullYear() + 10);

    // Reset time components for accurate date comparison
    today.setHours(0, 0, 0, 0);
    const expiryDateOnly = new Date(date);
    expiryDateOnly.setHours(0, 0, 0, 0);

    // Check if date is in the past
    if (expiryDateOnly < today) {
      return 'License has already expired. Please renew your license first.';
    }

    // Check if date is too close (less than 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(0, 0, 0, 0);

    if (expiryDateOnly < thirtyDaysFromNow) {
      return 'License expires within 30 days. Please renew your license first.';
    }

    // Check if date is reasonable (not more than 10 years in future)
    if (expiryDateOnly > tenYearsFromNow) {
      return 'Expiry date seems too far in the future. Please check the date.';
    }

    // Additional validation for minimum validity period
    if (expiryDateOnly < oneYearFromNow) {
      return 'License should be valid for at least one year from today.';
    }

    return null; // Valid
  };

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
    
    // Validate the selected date
    const error = validateExpiryDate(currentDate);
    setExpiryDateError(error || '');
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

    setIsValidating(true);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      // Validate the selected image
      const validationError = await validateImageFile(imageUri);
      
      if (validationError) {
        setIsValidating(false);
        Alert.alert('Invalid Image', validationError);
        return;
      }

      // Check file size (approximate check based on quality and dimensions)
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileSizeInMB = blob.size / (1024 * 1024);
        
        if (fileSizeInMB > 10) {
          setIsValidating(false);
          Alert.alert('File Too Large', 'Image file size must be less than 10MB. Please select a smaller image or reduce quality.');
          return;
        }
      } catch (error) {
        console.warn('Could not check file size:', error);
        // Continue without file size check if it fails
      }
      
      if (docType === 'driverLicense') {
        setDriverLicense(prev => ({ ...prev, [side!]: imageUri }));
      } else if (docType === 'nationalId') {
        setNationalId(prev => ({ ...prev, [side!]: imageUri }));
      } else if (docType === 'billingProof') {
        setBillingProof(prev => ({ ...prev, [side!]: imageUri }));
      }
    }
    
    setIsValidating(false);
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
    // Document validation checks
    if (!driverLicense.frontSide) {
      Alert.alert('Missing Documents', 'Please upload your driving license.');
      return;
    }
    if (!nationalId.frontSide) {
      Alert.alert('Missing Documents', 'Please upload your national ID card.');
      return;
    }

    // License number validation
    const licenseError = validateLicenseNumber(licenseNumber);
    if (licenseError) {
      setLicenseNumberError(licenseError);
      Alert.alert('Invalid License Number', licenseError);
      return;
    }

    // Expiry date validation
    if (!licenseExpiry.trim()) {
      Alert.alert('Missing Information', 'Please enter your license expiry date.');
      return;
    }

    const dateError = validateExpiryDate(expiryDate);
    if (dateError) {
      setExpiryDateError(dateError);
      Alert.alert('Invalid Expiry Date', dateError);
      return;
    }

    // Check if there are any existing validation errors
    if (licenseNumberError || expiryDateError) {
      Alert.alert('Validation Errors', 'Please fix the validation errors before continuing.');
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
                <Text className="font-bold">Minimum 300x300 pixels</Text> resolution required for clarity.
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text className="ml-2 text-gray-700">
                Ensure <Text className="font-bold">all text is readable</Text> and no glare obscures information.
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text className="ml-2 text-gray-700">
                Maximum <Text className="font-bold">file size</Text> per document is 10 MB.
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark" size={20} color="#8B5CF6" />
              <Text className="ml-2 text-gray-700">
                <Text className="font-bold">License number</Text> must contain both letters and numbers.
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text className="ml-2 text-gray-700">
                License must be <Text className="font-bold">valid for at least 1 year</Text> from today.
              </Text>
            </View>
            <Text className="ml-7 text-gray-500 text-sm">Supported formats: JPG, PNG. Auto-validation included.</Text>
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
            className={`border rounded-lg p-3 mb-1 text-gray-700 ${
              licenseNumberError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter Driving Licence Number"
            placeholderTextColor="#9CA3AF"
            value={licenseNumber}
            onChangeText={(text) => {
              setLicenseNumber(text);
              // Real-time validation
              const error = validateLicenseNumber(text);
              setLicenseNumberError(error || '');
            }}
            maxLength={20}
          />
          {licenseNumberError ? (
            <Text className="text-red-500 text-sm mb-2 ml-1">
              {licenseNumberError}
            </Text>
          ) : null}
          <TouchableOpacity
            className={`border rounded-lg p-3 flex-row items-center justify-between ${
              expiryDateError ? 'border-red-500' : 'border-gray-300'
            }`}
            onPress={() => setShowDatePicker(true)}
          >
            <Text className={`text-gray-700 ${!licenseExpiry ? 'text-gray-400' : ''}`}>
              {licenseExpiry || 'Select Expiry Date (DD/MM/YYYY)'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          {expiryDateError ? (
            <Text className="text-red-500 text-sm mb-2 ml-1">
              {expiryDateError}
            </Text>
          ) : null}
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
            isUploading || isValidating ? 'bg-gray-400' : 'bg-orange-500'
          }`}
          disabled={isUploading || isValidating}
        >
          <Text className="text-white text-lg font-bold">
            {isUploading ? 'Uploading...' : isValidating ? 'Validating...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UploadPersonalDocs;
