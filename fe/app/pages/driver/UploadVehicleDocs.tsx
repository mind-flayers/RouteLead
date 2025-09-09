import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import TopBar from '../../../components/ui/TopBar';
import ProgressBar from '../../../components/ui/ProgressBar';
import { VerificationApiService } from '../../../services/verificationApiService';
import { VerificationFlowService } from '../../../services/verificationFlowService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Config } from '@/constants/Config';

interface VehicleDocuments {
  frontView?: string;
  backView?: string;
  insideView?: string;
  vehicleLicense?: string;
  vehicleInsurance?: string;
  vehicleRegistration?: string;
  ownerNicFront?: string;
  ownerNicBack?: string;
}

const UploadVehicleDocs = () => {
  const [isOwner, setIsOwner] = useState<boolean | null>(true);
  const [documents, setDocuments] = useState<VehicleDocuments>({});
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const verificationFlow = VerificationFlowService.getInstance();

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
          
          // Populate existing vehicle documents if any
          const existingVehicleReg = flowState.documents.find(doc => doc.documentType === 'VEHICLE_REGISTRATION');
          const existingVehicleIns = flowState.documents.find(doc => doc.documentType === 'INSURANCE');
          
          if (existingVehicleReg && existingVehicleReg.localUri) {
            setDocuments(prev => ({ ...prev, vehicleRegistration: existingVehicleReg.localUri }));
          }
          
          if (existingVehicleIns && existingVehicleIns.localUri) {
            setDocuments(prev => ({ ...prev, vehicleInsurance: existingVehicleIns.localUri }));
          }
        }
      } catch (error) {
        console.error('Error initializing component:', error);
        Alert.alert('Error', 'Failed to initialize verification. Please try again.');
      }
    };

    initializeComponent();
  }, []);

  const pickDocument = async (docType: keyof VehicleDocuments) => {
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
      setDocuments(prev => ({ ...prev, [docType]: result.assets[0].uri }));
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

  const validateAndSubmit = () => {
    // Check ONLY required vehicle documents that are supported by backend
    if (!documents.vehicleRegistration) {
      Alert.alert('Missing Document', 'Please upload vehicle registration document.');
      return;
    }
    if (!documents.vehicleInsurance) {
      Alert.alert('Missing Document', 'Please upload vehicle insurance document.');
      return;
    }

    // Note: Vehicle photos and owner NIC validation removed as they're not supported by backend enum
    // Backend only supports: DRIVERS_LICENSE, NATIONAL_ID, VEHICLE_REGISTRATION, INSURANCE, FACE_PHOTO

    // All required documents are uploaded, proceed with submission
    Alert.alert(
      'Submit for Review',
      'Are you sure you want to submit your documents for review? You won\'t be able to edit them after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: handleFinalSubmission }
      ]
    );
  };

  const handleFinalSubmission = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    try {
      setIsUploading(true);

      // Upload only SUPPORTED vehicle documents (match backend DocumentTypeEnum)
      const uploadPromises = [];

      // Only upload document types that exist in backend enum
      if (documents.vehicleRegistration) {
        uploadPromises.push(uploadDocument(userId, documents.vehicleRegistration, 'VEHICLE_REGISTRATION'));
      }
      if (documents.vehicleInsurance) {
        uploadPromises.push(uploadDocument(userId, documents.vehicleInsurance, 'INSURANCE'));
      }

      // Note: Vehicle photos and owner NIC are not supported by current backend enum
      // Backend only supports: DRIVERS_LICENSE, NATIONAL_ID, VEHICLE_REGISTRATION, INSURANCE, FACE_PHOTO
      console.log('📋 Uploading only supported document types: VEHICLE_REGISTRATION, INSURANCE');

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Save vehicle data to backend (retrieved from AsyncStorage)
      try {
        const vehicleDataString = await AsyncStorage.getItem('vehicleData');
        if (vehicleDataString) {
          const vehicleData = JSON.parse(vehicleDataString);
          
          // Prepare vehicle data for backend API
          const vehiclePayload = {
            driverId: userId,
            color: vehicleData.color,
            make: vehicleData.manufacturer,
            model: vehicleData.model,
            yearOfManufacture: parseInt(vehicleData.year),
            plateNumber: vehicleData.licensePlate,
            maxWeightKg: vehicleData.maxWeightKg || 0,
            maxVolumeM3: vehicleData.maxVolumeM3 || 0,
          };

          // Use the same approach as VerificationApiService (simple fetch with auth)
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          
          const response = await fetch(`${Config.API_BASE}/vehicles`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(vehiclePayload),
          });

          if (response.ok) {
            console.log('✅ Vehicle data saved successfully');
            // Clear stored vehicle data
            await AsyncStorage.removeItem('vehicleData');
          } else {
            console.log('⚠️ Vehicle data save failed, but continuing with verification');
          }
        }
      } catch (vehicleError) {
        console.error('Error saving vehicle data:', vehicleError);
        console.log('⚠️ Vehicle data save failed, but continuing with verification');
      }

      // Submit for verification
      await VerificationApiService.submitForVerification(userId);

      Alert.alert(
        'Verification Submitted Successfully!',
        'Your documents have been submitted for review. Your verification status is now PENDING. You will be notified once the review is complete.',
        [
          { text: 'View Status', onPress: () => router.replace('/pages/driver/Profile?verificationSubmitted=true') }
        ]
      );
      
    } catch (error) {
      console.error('Error submitting documents:', error);
      Alert.alert('Submission Failed', error instanceof Error ? error.message : 'Failed to submit documents. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <TopBar title="Upload Vehicle Documents" />
      <ProgressBar currentStep={4} />

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

        {/* Vehicle Ownership Toggle */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <Text className="text-lg font-bold mb-4">Vehicle Ownership</Text>
          <TouchableOpacity
            className={`flex-row items-center py-3 px-2 rounded-lg mb-2 ${
              isOwner === true ? 'bg-orange-50 border border-orange-300' : 'border border-transparent'
            }`}
            onPress={() => setIsOwner(true)}
          >
            <Ionicons
              name={isOwner === true ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={isOwner === true ? '#F97316' : '#9CA3AF'}
            />
            <Text className="ml-2 text-lg">I am the owner of the vehicle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-row items-center py-3 px-2 rounded-lg ${
              isOwner === false ? 'bg-orange-50 border border-orange-300' : 'border border-transparent'
            }`}
            onPress={() => setIsOwner(false)}
          >
            <Ionicons
              name={isOwner === false ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={isOwner === false ? '#F97316' : '#9CA3AF'}
            />
            <Text className="ml-2 text-lg">I am not the owner of the vehicle</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold mb-2">Vehicle Pictures</Text>
        <Text className="text-gray-600 text-sm mb-4">(Optional - for reference only)</Text>

        {/* Front View of the Vehicle */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="car-multiple" size={24} color="black" />
              <Text className="ml-2 text-lg font-bold">Front View of the Vehicle</Text>
            </View>
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color={documents.frontView ? "#22C55E" : "#E5E7EB"} 
            />
          </View>
          <Text className="text-gray-600 mb-4">
            Upload clear front view of the vehicle.
          </Text>
          <TouchableOpacity 
            className={`flex-row items-center justify-center border rounded-lg py-3 ${
              documents.frontView ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onPress={() => pickDocument('frontView')}
          >
            <Ionicons 
              name={documents.frontView ? "checkmark-circle" : "cloud-upload-outline"} 
              size={20} 
              color={documents.frontView ? "#22C55E" : "#3B82F6"} 
            />
            <Text className={`ml-2 font-bold ${
              documents.frontView ? 'text-green-600' : 'text-blue-600'
            }`}>
              {documents.frontView ? 'Picture Uploaded ✓' : 'Upload Picture'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back View of the Vehicle */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="car-multiple" size={24} color="black" />
              <Text className="ml-2 text-lg font-bold">Back View of the Vehicle</Text>
            </View>
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color={documents.backView ? "#22C55E" : "#E5E7EB"} 
            />
          </View>
          <Text className="text-gray-600 mb-4">
            Upload clear back view of the vehicle.
          </Text>
          <TouchableOpacity 
            className={`flex-row items-center justify-center border rounded-lg py-3 ${
              documents.backView ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onPress={() => pickDocument('backView')}
          >
            <Ionicons 
              name={documents.backView ? "checkmark-circle" : "cloud-upload-outline"} 
              size={20} 
              color={documents.backView ? "#22C55E" : "#3B82F6"} 
            />
            <Text className={`ml-2 font-bold ${
              documents.backView ? 'text-green-600' : 'text-blue-600'
            }`}>
              {documents.backView ? 'Picture Uploaded ✓' : 'Upload Picture'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inside View of the Vehicle */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="car-multiple" size={24} color="black" />
              <Text className="ml-2 text-lg font-bold">Inside View of the Vehicle</Text>
            </View>
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color={documents.insideView ? "#22C55E" : "#E5E7EB"} 
            />
          </View>
          <Text className="text-gray-600 mb-4">
            Upload clear photo of inside view of the vehicle.
          </Text>
          <TouchableOpacity 
            className={`flex-row items-center justify-center border rounded-lg py-3 ${
              documents.insideView ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onPress={() => pickDocument('insideView')}
          >
            <Ionicons 
              name={documents.insideView ? "checkmark-circle" : "cloud-upload-outline"} 
              size={20} 
              color={documents.insideView ? "#22C55E" : "#3B82F6"} 
            />
            <Text className={`ml-2 font-bold ${
              documents.insideView ? 'text-green-600' : 'text-blue-600'
            }`}>
              {documents.insideView ? 'Picture Uploaded ✓' : 'Upload Picture'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold mb-4">Vehicle Documents</Text>

        {/* Important Notice */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="ml-2 text-sm font-bold text-blue-800">Required Documents</Text>
          </View>
          <Text className="text-blue-700 text-sm">
            Only <Text className="font-bold">Vehicle Registration</Text> and <Text className="font-bold">Vehicle Insurance</Text> are required for verification.
          </Text>
          <Text className="text-blue-600 text-xs mt-1">
            Other documents can be uploaded but are optional.
          </Text>
        </View>

        {/* Vehicle Licence */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="file-document-outline" size={24} color="black" />
              <Text className="ml-2 text-lg font-bold">Vehicle Licence</Text>
            </View>
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color={documents.vehicleLicense ? "#22C55E" : "#E5E7EB"} 
            />
          </View>
          <Text className="text-gray-600 mb-4">
            Upload clear photo of vehicle licence.
          </Text>
          <TouchableOpacity 
            className={`flex-row items-center justify-center border rounded-lg py-3 ${
              documents.vehicleLicense ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onPress={() => pickDocument('vehicleLicense')}
          >
            <Ionicons 
              name={documents.vehicleLicense ? "checkmark-circle" : "cloud-upload-outline"} 
              size={20} 
              color={documents.vehicleLicense ? "#22C55E" : "#3B82F6"} 
            />
            <Text className={`ml-2 font-bold ${
              documents.vehicleLicense ? 'text-green-600' : 'text-blue-600'
            }`}>
              {documents.vehicleLicense ? 'Document Uploaded ✓' : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Insurance */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="file-document-outline" size={24} color="black" />
              <Text className="ml-2 text-lg font-bold">Vehicle Insurance</Text>
              <Text className="ml-2 text-xs text-red-600 font-bold">(REQUIRED)</Text>
            </View>
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color={documents.vehicleInsurance ? "#22C55E" : "#E5E7EB"} 
            />
          </View>
          <Text className="text-gray-600 mb-4">
            Upload document of vehicle insurance.
          </Text>
          <TouchableOpacity 
            className={`flex-row items-center justify-center border rounded-lg py-3 ${
              documents.vehicleInsurance ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onPress={() => pickDocument('vehicleInsurance')}
          >
            <Ionicons 
              name={documents.vehicleInsurance ? "checkmark-circle" : "cloud-upload-outline"} 
              size={20} 
              color={documents.vehicleInsurance ? "#22C55E" : "#3B82F6"} 
            />
            <Text className={`ml-2 font-bold ${
              documents.vehicleInsurance ? 'text-green-600' : 'text-blue-600'
            }`}>
              {documents.vehicleInsurance ? 'Document Uploaded ✓' : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Registration */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="file-document-outline" size={24} color="black" />
              <Text className="ml-2 text-lg font-bold">Vehicle Registration</Text>
              <Text className="ml-2 text-xs text-red-600 font-bold">(REQUIRED)</Text>
            </View>
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color={documents.vehicleRegistration ? "#22C55E" : "#E5E7EB"} 
            />
          </View>
          <Text className="text-gray-600 mb-4">
            Upload document of vehicle registration.
          </Text>
          <TouchableOpacity 
            className={`flex-row items-center justify-center border rounded-lg py-3 ${
              documents.vehicleRegistration ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onPress={() => pickDocument('vehicleRegistration')}
          >
            <Ionicons 
              name={documents.vehicleRegistration ? "checkmark-circle" : "cloud-upload-outline"} 
              size={20} 
              color={documents.vehicleRegistration ? "#22C55E" : "#3B82F6"} 
            />
            <Text className={`ml-2 font-bold ${
              documents.vehicleRegistration ? 'text-green-600' : 'text-blue-600'
            }`}>
              {documents.vehicleRegistration ? 'Document Uploaded ✓' : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* If not the owner of the vehicle */}
        {!isOwner && (
          <View className="bg-white rounded-lg p-4 shadow-md mb-4">
            <Text className="text-lg font-bold mb-4">If you are not the owner of the vehicle</Text>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="file-document-outline" size={24} color="black" />
                <Text className="ml-2 text-lg font-bold">Owner's National ID Card</Text>
              </View>
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={documents.ownerNicFront && documents.ownerNicBack ? "#22C55E" : "#E5E7EB"} 
              />
            </View>
            <Text className="text-gray-600 mb-4">
              Upload clear front and back images of NIC of owner of the vehicle.
            </Text>
            <TouchableOpacity 
              className={`flex-row items-center justify-center border rounded-lg py-3 mb-2 ${
                documents.ownerNicFront ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}
              onPress={() => pickDocument('ownerNicFront')}
            >
              <Ionicons 
                name={documents.ownerNicFront ? "checkmark-circle" : "cloud-upload-outline"} 
                size={20} 
                color={documents.ownerNicFront ? "#22C55E" : "#3B82F6"} 
              />
              <Text className={`ml-2 font-bold ${
                documents.ownerNicFront ? 'text-green-600' : 'text-blue-600'
              }`}>
                {documents.ownerNicFront ? 'Front Side Uploaded ✓' : 'Front Side of NIC'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-row items-center justify-center border rounded-lg py-3 ${
                documents.ownerNicBack ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}
              onPress={() => pickDocument('ownerNicBack')}
            >
              <Ionicons 
                name={documents.ownerNicBack ? "checkmark-circle" : "cloud-upload-outline"} 
                size={20} 
                color={documents.ownerNicBack ? "#22C55E" : "#3B82F6"} 
              />
              <Text className={`ml-2 font-bold ${
                documents.ownerNicBack ? 'text-green-600' : 'text-blue-600'
              }`}>
                {documents.ownerNicBack ? 'Back Side Uploaded ✓' : 'Back Side of NIC'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
          onPress={validateAndSubmit}
          className={`flex-1 ml-2 py-3 rounded-lg items-center ${
            isUploading ? 'bg-gray-400' : 'bg-orange-500'
          }`}
          disabled={isUploading}
        >
          <Text className="text-white text-lg font-bold">
            {isUploading ? 'Submitting...' : 'Submit for Review'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UploadVehicleDocs;
