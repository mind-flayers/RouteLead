import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import BottomNavigationBar from '../../../components/ui/BottomNavigationBar';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation();

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

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
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
            <FontAwesome5 name="edit" size={20} color="#3B82F6" />
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
          <Text className="text-xl font-bold text-gray-800">John Doe</Text>
          <Text className="text-gray-500 text-sm">john.doe@routedriver.com</Text>
        </PrimaryCard>

        {/* Account & Vehicle Section */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">Account & Vehicle</Text>
        <PrimaryCard className="mb-4 p-0">
          <TouchableOpacity onPress={() => navigateTo('pages/driver/PersonalInformation')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <FontAwesome5 name="user-circle" size={20} color="#3B82F6" />
              <Text className="ml-3 text-base text-gray-700">Personal Information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateTo('pages/driver/UploadFacePhoto')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <FontAwesome5 name="shield-alt" size={20} color="#3B82F6" />
              <Text className="ml-3 text-base text-gray-700">Get Verified</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-500 text-xs font-semibold mr-2">Verified</Text>
              <Ionicons name="chevron-forward" size={20} color="gray" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Payment Preferences')} className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <FontAwesome5 name="credit-card" size={20} color="#3B82F6" />
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
              <Ionicons name="notifications" size={20} color="#3B82F6" />
              <Text className="ml-3 text-base text-gray-700">Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Theme Settings')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="color-palette" size={20} color="#3B82F6" />
              <Text className="ml-3 text-base text-gray-700">Theme Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Change Language')} className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <FontAwesome5 name="language" size={20} color="#3B82F6" />
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
              <FontAwesome5 name="lock" size={20} color="#3B82F6" />
              <Text className="ml-3 text-base text-gray-700">Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Help & Support')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="lifebuoy" size={20} color="#3B82F6" />
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
        <PrimaryButton title="Logout" onPress={() => console.log('Logout')} className="bg-red-500 mb-20" />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavigationBar activeTab="profile" />
    </SafeAreaView>
  );
};

export default Profile;
