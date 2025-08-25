import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import TopBar from '../../../components/ui/TopBar';
import ProgressBar from '../../../components/ui/ProgressBar';
import { VerificationApiService } from '../../../services/verificationApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UploadFacePhoto = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permissions are required to upload photos.');
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

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add your photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!selectedImage) {
      Alert.alert('Photo Required', 'Please upload your face photo to continue.');
      return;
    }

    try {
      setIsUploading(true);
      
      // Get current user ID
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }
      
      const user = JSON.parse(userData);
      const driverId = user.id;

      // Create FormData for file upload
      const formData = new FormData();
      
      // Convert image URI to file object for upload
      const fileName = `face_photo_${driverId}_${Date.now()}.jpg`;
      
      formData.append('file', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: fileName,
      } as any);

      // Upload face photo using our API service
      await VerificationApiService.uploadDocument(driverId, formData.get('file'), 'FACE_PHOTO');
      
      Alert.alert(
        'Success!', 
        'Face photo uploaded successfully!',
        [{ text: 'OK', onPress: () => router.push('/pages/driver/UploadPersonalDocs') }]
      );
      
    } catch (error) {
      console.error('Error uploading face photo:', error);
      Alert.alert('Upload Failed', 'Failed to upload face photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <TopBar title="Upload Face Picture" />
      <ProgressBar currentStep={1} />

      <View className="flex-1 p-4">
        <View className="bg-white rounded-lg p-4 shadow-md">
          <Text className="text-xl font-bold mb-2">Upload Driver Face Picture</Text>
          <Text className="text-gray-600 mb-4">
            Please upload a clear, recent headshot for your driver profile.
          </Text>

          <TouchableOpacity 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center mb-4"
            onPress={showImagePickerOptions}
          >
            {selectedImage ? (
              <View className="items-center">
                <Image 
                  source={{ uri: selectedImage }} 
                  className="w-32 h-32 rounded-lg mb-2"
                />
                <Text className="text-green-600 font-semibold">Photo Selected</Text>
                <Text className="text-gray-500 text-sm">Tap to change</Text>
              </View>
            ) : (
              <>
                <MaterialCommunityIcons name="camera-plus-outline" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">Take Picture of your face</Text>
                <Text className="text-gray-400 text-sm mt-1">or choose from gallery</Text>
              </>
            )}
          </TouchableOpacity>

          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2 text-gray-800">Photo Requirements:</Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text className="ml-2 text-gray-700">Ensure good lighting and a clear background.</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text className="ml-2 text-gray-700">Face must be fully visible, no hats or sunglasses.</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text className="ml-2 text-gray-700">Picture should be recent and in color.</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text className="ml-2 text-gray-700">Minimum resolution: 600x600 pixels.</Text>
            </View>
          </View>

          <TouchableOpacity
            className={`py-3 rounded-lg items-center ${
              selectedImage && !isUploading ? 'bg-orange-500' : 'bg-gray-400'
            }`}
            onPress={handleContinue}
            disabled={!selectedImage || isUploading}
          >
            <Text className="text-white text-lg font-bold">
              {isUploading ? 'Uploading...' : selectedImage ? 'Continue' : 'Choose Photo First'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UploadFacePhoto;
