import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import TopBar from '../../../components/ui/TopBar';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { VerificationFlowService, DOCUMENT_TYPE_NAMES, DOCUMENT_TYPE_DESCRIPTIONS } from '../../../services/verificationFlowService';
import { supabase } from '@/lib/supabase';

interface DocumentUploadState {
  [key: string]: {
    uploaded: boolean;
    url?: string;
    localUri?: string;
  };
}

const VerificationDocuments = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [verificationFlow] = useState(() => VerificationFlowService.getInstance());
  const [documents, setDocuments] = useState<DocumentUploadState>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canEdit, setCanEdit] = useState(true);

  // Success animation
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const slideAnim = useState(new Animated.Value(-100))[0];

  const requiredDocuments = [
    'FACE_PHOTO',
    'NATIONAL_ID', 
    'DRIVERS_LICENSE',
    'VEHICLE_REGISTRATION',
    'INSURANCE'
  ];

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to continue.');
        router.replace('/pages/login');
        return;
      }

      setUserId(user.id);
      
      // Initialize verification flow
      const flowState = await verificationFlow.initializeFlow(user.id);
      
      // Set up document state from existing uploads
      const docState: DocumentUploadState = {};
      requiredDocuments.forEach(docType => {
        const existingDoc = flowState.documents.find(doc => doc.documentType === docType);
        docState[docType] = {
          uploaded: existingDoc?.uploaded || false,
          url: existingDoc?.documentUrl,
          localUri: existingDoc?.localUri
        };
      });
      
      setDocuments(docState);
      setCanEdit(flowState.canEdit);
      
    } catch (error) {
      console.error('Error initializing component:', error);
      Alert.alert('Error', 'Failed to load verification status.');
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permissions are required to upload documents.');
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permissions are required to take photos.');
      return false;
    }
    return true;
  };

  const showImagePickerOptions = (documentType: string) => {
    if (!canEdit) {
      Alert.alert('Cannot Edit', 'Your verification has been submitted and cannot be edited.');
      return;
    }

    Alert.alert(
      `Upload ${DOCUMENT_TYPE_NAMES[documentType]}`,
      'Choose how you want to add your document',
      [
        { text: 'Camera', onPress: () => takePhoto(documentType) },
        { text: 'Gallery', onPress: () => pickImage(documentType) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const takePhoto = async (documentType: string) => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: documentType === 'FACE_PHOTO' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadDocument(documentType, result.assets[0].uri);
    }
  };

  const pickImage = async (documentType: string) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: documentType === 'FACE_PHOTO' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadDocument(documentType, result.assets[0].uri);
    }
  };

  const uploadDocument = async (documentType: string, imageUri: string) => {
    if (!userId) return;

    try {
      setIsUploading(true);

      const fileName = `${documentType.toLowerCase()}_${userId}_${Date.now()}.jpg`;
      const fileData = {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      };

      // Upload using VerificationFlowService
      await verificationFlow.uploadDocument(userId, fileData, documentType);

      // Update local state
      setDocuments(prev => ({
        ...prev,
        [documentType]: {
          uploaded: true,
          localUri: imageUri,
          url: imageUri // Temporarily use local URI until we get the server URL
        }
      }));

      Alert.alert('Success', `${DOCUMENT_TYPE_NAMES[documentType]} uploaded successfully!`);

    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!userId) return;

    try {
      setIsSubmitting(true);

      // Check if all documents are uploaded
      const allUploaded = requiredDocuments.every(docType => documents[docType]?.uploaded);
      
      if (!allUploaded) {
        const missingDocs = requiredDocuments
          .filter(docType => !documents[docType]?.uploaded)
          .map(docType => DOCUMENT_TYPE_NAMES[docType]);
        
        Alert.alert(
          'Missing Documents',
          `Please upload the following documents before submitting:\n\n${missingDocs.join('\n')}`
        );
        return;
      }

      // Submit for review
      const result = await verificationFlow.submitForReview(userId);

      if (result.success) {
        setCanEdit(false);
        showSuccessAnimation();
      } else {
        Alert.alert('Submission Failed', result.message);
      }

    } catch (error) {
      console.error('Error submitting for review:', error);
      Alert.alert('Submission Failed', 'Failed to submit documents for review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccessAnimation = () => {
    setShowSuccessAlert(true);
    
    // Animate slide down
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(3000), // Show for 3 seconds
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessAlert(false);
      // Navigate to profile with success parameter
      router.push('/pages/driver/Profile?verificationSubmitted=true');
    });
  };

  const renderDocumentItem = (documentType: string) => {
    const doc = documents[documentType];
    const isUploaded = doc?.uploaded || false;

    return (
      <View key={documentType} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {DOCUMENT_TYPE_NAMES[documentType]}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {DOCUMENT_TYPE_DESCRIPTIONS[documentType]}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => showImagePickerOptions(documentType)}
            disabled={!canEdit}
            className={`p-3 rounded-lg ${isUploaded ? 'bg-green-100' : 'bg-orange-100'} ${!canEdit ? 'opacity-50' : ''}`}
          >
            {isUploaded ? (
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
            ) : (
              <MaterialCommunityIcons name="camera-plus" size={24} color="#F97316" />
            )}
          </TouchableOpacity>
        </View>

        {isUploaded && doc.localUri && (
          <View className="mt-3">
            <Image source={{ uri: doc.localUri }} className="w-full h-32 rounded-lg" resizeMode="cover" />
            {canEdit && (
              <TouchableOpacity
                onPress={() => showImagePickerOptions(documentType)}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow"
              >
                <MaterialCommunityIcons name="pencil" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const getProgress = () => {
    const uploadedCount = requiredDocuments.filter(docType => documents[docType]?.uploaded).length;
    return Math.round((uploadedCount / requiredDocuments.length) * 100);
  };

  const allDocumentsUploaded = requiredDocuments.every(docType => documents[docType]?.uploaded);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Success Alert */}
      {showSuccessAlert && (
        <Animated.View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            transform: [{ translateY: slideAnim }],
          }}
          className="bg-green-500 mx-4 mt-2 p-4 rounded-lg shadow-lg flex-row items-center"
        >
          <Ionicons name="checkmark-circle" size={24} color="white" />
          <Text className="text-white font-semibold ml-2 flex-1">
            Documents submitted for review! 🎉
          </Text>
        </Animated.View>
      )}

      <TopBar title="Verification Documents" />
      <ProgressBar currentStep={2} />

      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-2">Upload Required Documents</Text>
          <Text className="text-gray-600 mb-3">
            Please upload all required documents to complete your verification.
          </Text>
          
          {/* Progress */}
          <View className="flex-row items-center">
            <View className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
              <View 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${getProgress()}%` }}
              />
            </View>
            <Text className="text-sm font-semibold text-gray-700">{getProgress()}%</Text>
          </View>
        </View>

        {/* Document List */}
        {requiredDocuments.map(documentType => renderDocumentItem(documentType))}

        {/* Submit Button */}
        <View className="mt-6 mb-8">
          <PrimaryButton
            title={isSubmitting ? 'Submitting...' : 'Submit for Review'}
            onPress={handleSubmitForReview}
            disabled={!allDocumentsUploaded || isUploading || isSubmitting || !canEdit}
            className={`${
              allDocumentsUploaded && canEdit && !isUploading && !isSubmitting
                ? 'bg-green-500' 
                : 'bg-gray-400'
            }`}
          />
          
          {!canEdit && (
            <Text className="text-center text-sm text-gray-600 mt-2">
              Your documents have been submitted and are under review.
            </Text>
          )}
          
          {allDocumentsUploaded && canEdit && (
            <Text className="text-center text-sm text-green-600 mt-2">
              All documents uploaded! Ready to submit for review.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerificationDocuments;
