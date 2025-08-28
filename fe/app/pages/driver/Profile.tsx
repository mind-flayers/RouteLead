import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useLocalSearchParams } from 'expo-router';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import DriverBottomNavigation from '@/components/navigation/DriverBottomNavigation';
import { VerificationApiService, VerificationStatus, VerificationRequirements } from '../../../services/verificationApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const [userName, setUserName] = useState('Loading...');
  const [userEmail, setUserEmail] = useState('Loading...');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [verificationRequirements, setVerificationRequirements] = useState<VerificationRequirements | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Success alert state
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const slideAnim = useState(new Animated.Value(-100))[0]; // Initial position off-screen

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          // Fetch basic profile data
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            setUserName('Error');
            setUserEmail('Error');
          } else if (data) {
            setUserName(`${data.first_name || ''} ${data.last_name || ''}`.trim());
            setUserEmail(data.email || '');
          }

          // Fetch verification status
          try {
            const verificationData = await VerificationApiService.getVerificationStatus(user.id);
            setVerificationStatus(verificationData);
            
            const requirementsData = await VerificationApiService.getVerificationRequirements(user.id);
            setVerificationRequirements(requirementsData);
          } catch (error) {
            console.error('Error fetching verification data:', error);
          }
        } else {
          setUserName('Guest');
          setUserEmail('N/A');
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Check for success parameter and show alert
  useEffect(() => {
    if (params.profileUpdated === 'true') {
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
      });
    } else if (params.verificationSubmitted === 'true') {
      setShowSuccessAlert(true);
      
      // Animate slide down for verification success
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(4000), // Show for 4 seconds for verification
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccessAlert(false);
      });
    }
  }, [params.profileUpdated, params.verificationSubmitted]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleEditProfilePicture = () => {
    // Logic to open gallery
    console.log('Open gallery to change profile picture');
  };

  const navigateTo = (screen: string) => {
    (navigation as any).navigate(screen);
  };

  const getVerificationStatusDisplay = () => {
    if (!verificationStatus) {
      return { text: 'Loading...', color: 'text-gray-500' };
    }

    if (verificationStatus.isVerified) {
      return { text: 'Verified', color: 'text-green-500' };
    } else if (verificationRequirements?.personalInfoComplete === false) {
      return { text: 'Not Verified', color: 'text-red-500' };
    } else if (verificationStatus.verificationStatus === 'PENDING') {
      return { text: 'Pending', color: 'text-yellow-500' };
    } else {
      // NULL or any other status means "Not Verified"
      return { text: 'Not Verified', color: 'text-red-500' };
    }
  };

  const handleGetVerified = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    // Check if already verified (cannot edit)
    if (verificationStatus?.verificationStatus === 'APPROVED' || verificationStatus?.isVerified) {
      Alert.alert('Already Verified', 'Your account is already verified!');
      return;
    }

    try {
      // Check if personal information is complete
      const requirements = await VerificationApiService.getVerificationRequirements(userId);
      
      if (!requirements.personalInfoComplete) {
        Alert.alert(
          'Personal Information Required',
          'Please fill Personal Information first before starting the verification process.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Fill Info', onPress: () => navigateTo('pages/driver/PersonalInformation') }
          ]
        );
        return;
      }

      // If personal info is complete, check verification status
      if (verificationStatus?.verificationStatus === 'PENDING') {
        Alert.alert(
          'Documents Under Review', 
          'Your verification documents are currently being reviewed. You can still make changes while in pending status.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Edit Documents', onPress: () => navigateTo('pages/driver/VerificationDocuments') }
          ]
        );
        return;
      }

      if (verificationStatus?.verificationStatus === 'REJECTED') {
        Alert.alert(
          'Verification Rejected', 
          'Some of your documents were rejected. Please upload new documents.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Resubmit', onPress: () => navigateTo('pages/driver/VerificationDocuments') }
          ]
        );
        return;
      }

      // Start verification process
      navigateTo('pages/driver/UploadFacePhoto');
    } catch (error) {
      console.error('Error checking verification requirements:', error);
      Alert.alert('Error', 'Failed to check verification requirements. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Error logging out:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              } else {
                // Navigate to login/auth screen
                // Adjust the route based on your app's authentication flow
                router.replace('/pages/login');
              }
            } catch (error) {
              console.error('Unexpected error during logout:', error);
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

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
            {params.verificationSubmitted === 'true' 
              ? 'Verification documents submitted successfully! 🎉' 
              : 'Profile updated successfully! 🎉'
            }
          </Text>
        </Animated.View>
      )}

      {/* Top Bar */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">Profile</Text>
        <View className="w-10" />{/* Placeholder for alignment */}
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Profile Card */}
        <PrimaryCard className="mb-4 p-4 items-center relative">
          <TouchableOpacity onPress={handleEditProfilePicture} className="absolute top-4 right-4 p-2">
            <FontAwesome5 name="edit" size={20} color="#f97316" />
          </TouchableOpacity>
          <View className="relative mb-3">
            <Image
              source={require('../../../assets/images/profile_placeholder.jpeg')}
              className="w-24 h-24 rounded-full"
            />
            {/* Verification Icon - conditionally rendered */}
            <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 border-2 border-white">
              <Ionicons name="checkmark-sharp" size={16} color="white" />
            </View>
          </View>
          <Text className="text-xl font-bold text-gray-800">{userName}</Text>
          <Text className="text-gray-500 text-sm">{userEmail}</Text>
        </PrimaryCard>

        {/* Account & Vehicle Section */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">Account & Vehicle</Text>
        <PrimaryCard className="mb-4 p-0">
          <TouchableOpacity onPress={() => navigateTo('pages/driver/PersonalInformation')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <FontAwesome5 name="user-circle" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Personal Information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGetVerified} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <FontAwesome5 name="shield-alt" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Get Verified</Text>
            </View>
            <View className="flex-row items-center">
              <Text className={`text-xs font-semibold mr-2 ${getVerificationStatusDisplay().color}`}>
                {getVerificationStatusDisplay().text}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="gray" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Payment Preferences')} className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <FontAwesome5 name="credit-card" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Payment Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
        </PrimaryCard>

        {/* App Preferences Section */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">App Preferences</Text>
        <PrimaryCard className="mb-4 p-0">
          <TouchableOpacity onPress={() => navigateTo('pages/driver/Notifications')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="notifications" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Theme Settings')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="color-palette" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Theme Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Change Language')} className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <FontAwesome5 name="language" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Change Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
        </PrimaryCard>

        {/* Support & Security Section */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">Support & Security</Text>
        <PrimaryCard className="mb-4 p-0">
          <TouchableOpacity onPress={() => console.log('Change Password')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <FontAwesome5 name="lock" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Help & Support')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="lifebuoy" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Delete Account')} className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <FontAwesome5 name="trash-alt" size={20} color="#EF4444" />
              <Text className="ml-3 text-base text-red-500">Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
        </PrimaryCard>

        {/* Logout Button */}
        <PrimaryButton title="Logout" onPress={handleLogout} className="bg-red-500 mb-20" />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <DriverBottomNavigation />
    </SafeAreaView>
  );
};

export default Profile;
