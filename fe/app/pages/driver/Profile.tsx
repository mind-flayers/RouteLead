import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';

const Profile = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('Loading...');
  const [userEmail, setUserEmail] = useState('Loading...');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
      } else {
        setUserName('Guest');
        setUserEmail('N/A');
      }
    };

    fetchUserProfile();
  }, []);

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
          <TouchableOpacity onPress={() => navigateTo('pages/driver/UploadFacePhoto')} className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <FontAwesome5 name="shield-alt" size={20} color="#f97316" />
              <Text className="ml-3 text-base text-gray-700">Get Verified</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-500 text-xs font-semibold mr-2">Verified</Text>
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
      <View className="flex-row justify-between items-center bg-white border-t border-gray-200 px-2 py-2 absolute bottom-0 w-full" style={{ minHeight: 60 }}>
        <Link href="/pages/driver/Dashboard" asChild>
          <TouchableOpacity className="flex-1 items-center justify-center py-1" style={{ minHeight: 56 }}>
            <View className="items-center justify-center">
              <Ionicons name="home" size={22} color="gray" />
              <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>Home</Text>
            </View>
          </TouchableOpacity>
        </Link>
        <Link href="/pages/driver/MyRoutes" asChild>
          <TouchableOpacity className="flex-1 items-center justify-center py-1" style={{ minHeight: 56 }}>
            <View className="items-center justify-center">
              <MaterialCommunityIcons name="truck-delivery" size={22} color="gray" />
              <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>Routes</Text>
            </View>
          </TouchableOpacity>
        </Link>
        <Link href="/pages/driver/MyEarnings" asChild>
          <TouchableOpacity className="flex-1 items-center justify-center py-1" style={{ minHeight: 56 }}>
            <View className="items-center justify-center">
              <FontAwesome5 name="dollar-sign" size={22} color="gray" />
              <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>Earnings</Text>
            </View>
          </TouchableOpacity>
        </Link>
        <Link href="/pages/driver/ChatList" asChild>
          <TouchableOpacity className="flex-1 items-center justify-center py-1" style={{ minHeight: 56 }}>
            <View className="items-center justify-center">
              <Ionicons name="chatbubbles" size={22} color="gray" />
              <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>Chats</Text>
            </View>
          </TouchableOpacity>
        </Link>
        <Link href="/pages/driver/Profile" asChild>
          <TouchableOpacity className="flex-1 items-center justify-center py-1" style={{ minHeight: 56 }}>
            <View className="items-center justify-center">
              <Ionicons name="person" size={22} color="#F97316" />
              <Text className="text-orange-500 text-xs mt-1" numberOfLines={1}>Profile</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
