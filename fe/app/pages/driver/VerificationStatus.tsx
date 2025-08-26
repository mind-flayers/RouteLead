import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { VerificationApiService, VerificationStatus, VerificationRequirements, DocumentCompleteness } from '../../../services/verificationApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VerificationStatusScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [requirements, setRequirements] = useState<VerificationRequirements | null>(null);
  const [documentStatus, setDocumentStatus] = useState<DocumentCompleteness | null>(null);

  useEffect(() => {
    loadVerificationData();
  }, []);

  const loadVerificationData = async () => {
    try {
      // Get current user ID
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }
      
      const user = JSON.parse(userData);
      const userId = user.id;
      setDriverId(userId);

      // Load verification data
      const [status, reqs, docStatus] = await Promise.all([
        VerificationApiService.getVerificationStatus(userId),
        VerificationApiService.getVerificationRequirements(userId),
        VerificationApiService.checkDocumentCompleteness(userId)
      ]);

      setVerificationStatus(status);
      setRequirements(reqs);
      setDocumentStatus(docStatus);
    } catch (error) {
      console.error('Error loading verification data:', error);
      Alert.alert('Error', 'Failed to load verification status. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVerificationData();
  };

  const getStatusColor = (isComplete: boolean) => {
    return isComplete ? '#22C55E' : '#EF4444';
  };

  const getStatusIcon = (isComplete: boolean) => {
    return isComplete ? 'checkmark-circle' : 'close-circle';
  };

  const handleStartVerification = () => {
    router.push('/pages/driver/PersonalInformation');
  };

  const handleViewDocuments = () => {
    router.push('/pages/driver/UploadFacePhoto');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-lg text-gray-600">Loading verification status...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">Verification Status</Text>
        <TouchableOpacity onPress={onRefresh} className="p-2">
          <Ionicons name="refresh" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Overall Status Card */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons 
              name="shield-check" 
              size={24} 
              color={verificationStatus?.isVerified ? '#22C55E' : '#F59E0B'} 
            />
            <Text className="ml-3 text-lg font-bold text-gray-800">Overall Status</Text>
          </View>
          
          <View className={`p-4 rounded-lg ${verificationStatus?.isVerified ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <Text className={`text-center text-lg font-bold ${verificationStatus?.isVerified ? 'text-green-800' : 'text-yellow-800'}`}>
              {verificationStatus?.isVerified ? 'Verified ✓' : 'Pending Verification'}
            </Text>
            <Text className={`text-center text-sm mt-2 ${verificationStatus?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {verificationStatus?.isVerified 
                ? 'Your account is fully verified and ready to accept deliveries!'
                : 'Complete all steps below to get verified'
              }
            </Text>
          </View>
        </View>

        {/* Personal Information Status */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Ionicons 
                name={getStatusIcon(verificationStatus?.personalInfoComplete || false)} 
                size={24} 
                color={getStatusColor(verificationStatus?.personalInfoComplete || false)} 
              />
              <View className="ml-3 flex-1">
                <Text className="text-lg font-semibold text-gray-800">Personal Information</Text>
                <Text className="text-sm text-gray-600">
                  {verificationStatus?.personalInfoComplete ? 'Completed' : 'Required information missing'}
                </Text>
                {requirements?.missingFields && requirements.missingFields.length > 0 && (
                  <Text className="text-xs text-red-600 mt-1">
                    Missing: {requirements.missingFields.join(', ')}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              onPress={handleStartVerification}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">
                {verificationStatus?.personalInfoComplete ? 'Edit' : 'Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Document Upload Status */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Ionicons 
                name={getStatusIcon(documentStatus?.isComplete || false)} 
                size={24} 
                color={getStatusColor(documentStatus?.isComplete || false)} 
              />
              <View className="ml-3 flex-1">
                <Text className="text-lg font-semibold text-gray-800">Document Upload</Text>
                <Text className="text-sm text-gray-600">
                  {documentStatus?.isComplete ? 'All documents uploaded' : 'Documents required'}
                </Text>
                {documentStatus?.missingDocuments && documentStatus.missingDocuments.length > 0 && (
                  <Text className="text-xs text-red-600 mt-1">
                    Missing: {documentStatus.missingDocuments.join(', ')}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              onPress={handleViewDocuments}
              className="bg-orange-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">
                {documentStatus?.isComplete ? 'View' : 'Upload'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Required Documents List */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Required Documents</Text>
          {documentStatus?.requiredDocuments.map((docType, index) => {
            const isUploaded = !documentStatus?.missingDocuments?.includes(docType);
            return (
              <View key={index} className="flex-row items-center py-2">
                <Ionicons 
                  name={isUploaded ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={20} 
                  color={isUploaded ? '#22C55E' : '#9CA3AF'} 
                />
                <Text className={`ml-3 ${isUploaded ? 'text-gray-800' : 'text-gray-500'}`}>
                  {docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        {!verificationStatus?.isVerified && requirements?.canStartVerification && (
          <View className="bg-white rounded-lg p-4 shadow-md mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">Next Steps</Text>
            <TouchableOpacity 
              onPress={handleStartVerification}
              className="bg-green-500 py-3 rounded-lg items-center mb-3"
            >
              <Text className="text-white text-lg font-bold">Start Verification Process</Text>
            </TouchableOpacity>
            <Text className="text-sm text-gray-600 text-center">
              Complete your profile and upload documents to get verified
            </Text>
          </View>
        )}

        {/* Help Section */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Need Help?</Text>
          <View className="flex-row items-center py-2">
            <Ionicons name="help-circle-outline" size={20} color="#3B82F6" />
            <Text className="ml-3 text-gray-700">Contact support for assistance</Text>
          </View>
          <View className="flex-row items-center py-2">
            <Ionicons name="time-outline" size={20} color="#3B82F6" />
            <Text className="ml-3 text-gray-700">Verification typically takes 24-48 hours</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerificationStatusScreen;
