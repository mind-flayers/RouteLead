import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { VerificationApiService, ProfileData, ProfileUpdateData } from '../../../services/verificationApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const sriLankanCities = [
  'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Batticaloa', 'Trincomalee', 'Anuradhapura',
  'Polonnaruwa', 'Nuwara Eliya', 'Ratnapura', 'Badulla', 'Matara', 'Kurunegala', 'Kegalle',
  'Kalutara', 'Mannar', 'Vavuniya', 'Kilinochchi', 'Ampara', 'Monaragala', 'Hambantota',
  'Puttalam', 'Chilaw', 'Panadura', 'Moratuwa', 'Dehiwala-Mount Lavinia', 'Sri Jayawardenepura Kotte',
];

const PersonalInformation = () => {
  const navigation = useNavigation();

  // State for form fields - start with empty values, load from API
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('MALE');
  const [nicNumber, setNicNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Colombo');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Loading and user state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);

  const genderOptions = ['MALE', 'FEMALE'];

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      // Get current user ID from Supabase auth (consistent with Profile.tsx)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userId = user.id;
        setDriverId(userId);

        // Load profile data from API
        const profile = await VerificationApiService.getProfile(userId);
        
        // Populate form fields with profile data
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setNicNumber(profile.nicNumber || '');
        setPhoneNumber(profile.phoneNumber || '');
        setEmailAddress(profile.email || '');
        setAddressLine1(profile.addressLine1 || '');
        setAddressLine2(profile.addressLine2 || '');
        setCity(profile.city || 'Colombo');
        
        // Load date and gender if available
        if (profile.dateOfBirth) {
          setDateOfBirth(new Date(profile.dateOfBirth));
        }
        if (profile.gender) {
          setGender(profile.gender);
        }
        
        console.log('Profile data loaded:', profile); // Debug log
        
        // Note: Additional fields like address, dateOfBirth, gender are not in basic profile
        // They will be populated from the form when available
      } else {
        Alert.alert('Error', 'User not authenticated. Please log in again.');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleSaveProfile = async () => {
    if (!driverId) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    try {
      setSaving(true);

      // Prepare profile update data with proper enum handling
      const profileUpdateData: ProfileUpdateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim().replace(/^0/, ''), // Remove leading zero for backend validation
        email: emailAddress.trim(),
        dateOfBirth: dateOfBirth.toISOString().split('T')[0], // YYYY-MM-DD format
        gender,
        addressLine1: addressLine1.trim(),
        city,
      };

      // Only add optional fields if they have values
      if (nicNumber.trim()) {
        profileUpdateData.nicNumber = nicNumber.trim();
      }
      if (addressLine2.trim()) {
        profileUpdateData.addressLine2 = addressLine2.trim();
      }

      // Remove empty fields to avoid validation issues
      Object.keys(profileUpdateData).forEach(key => {
        const value = profileUpdateData[key as keyof ProfileUpdateData];
        if (value === '' || value === null || value === undefined) {
          delete profileUpdateData[key as keyof ProfileUpdateData];
        }
      });

      // Save profile data
      const updatedProfile = await VerificationApiService.updateProfile(driverId, profileUpdateData);
      
      // Navigate to Profile page with success flag using Expo Router
      router.push({
        pathname: '/pages/driver/Profile',
        params: { profileUpdated: 'true' }
      });

      console.log('Profile Updated:', updatedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save profile. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Phone number')) {
          errorMessage = 'Please enter a valid phone number (9-15 digits, no leading zero).';
        } else if (error.message.includes('Email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('NIC')) {
          errorMessage = 'Please enter a valid NIC number in Sri Lankan format.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Some fields have invalid data. Please check your entries and try again.';
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Top Bar */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">My Profile</Text>
        <View className="w-10" />{/* Placeholder for alignment */}
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Personal Information Section */}
        <PrimaryCard className="mb-4 p-4">
          <View className="flex-row items-center mb-4">
            <Ionicons name="person-outline" size={24} color="#3B82F6" />
            <Text className="ml-3 text-lg font-bold text-gray-800">Personal Information</Text>
          </View>

          <Text className="text-sm text-gray-600 mb-1">First Name</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 bg-white text-base"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
          />

          <Text className="text-sm text-gray-600 mb-1">Last Name</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 bg-white text-base"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
          />

          <Text className="text-sm text-gray-600 mb-1">Date of Birth</Text>
          <TouchableOpacity onPress={showDatepicker} className="flex-row items-center border border-gray-300 rounded-md p-3 mb-4 bg-white">
            <FontAwesome5 name="calendar-alt" size={18} color="gray" />
            <Text className="ml-3 text-base text-gray-700">{dateOfBirth.toLocaleDateString('en-GB')}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="datePicker"
              value={dateOfBirth}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          <Text className="text-sm text-gray-600 mb-1">Gender</Text>
          <View className="relative">
            <TouchableOpacity onPress={() => setShowGenderPicker(true)} className="flex-row items-center justify-between border border-gray-300 rounded-md p-3 mb-4 bg-white">
              <Text className="text-base text-gray-700">{gender}</Text>
              <Ionicons name="chevron-down" size={20} color="gray" />
            </TouchableOpacity>
            {showGenderPicker && (
              <View className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md z-50" style={{ bottom: '100%', maxHeight: 150, marginBottom: 4 }}>
                <ScrollView nestedScrollEnabled={true}>
                  {genderOptions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      className="p-3 border-b border-gray-200"
                      onPress={() => {
                        setGender(item);
                        setShowGenderPicker(false);
                      }}
                    >
                      <Text className="text-base text-gray-700">{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <Text className="text-sm text-gray-600 mb-1">NIC Number</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 bg-white text-base"
            value={nicNumber}
            onChangeText={setNicNumber}
            placeholder="NIC Number"
            keyboardType="ascii-capable"
          />
        </PrimaryCard>

        {/* Contact Details Section */}
        <PrimaryCard className="mb-4 p-4">
          <View className="flex-row items-center mb-4">
            <Ionicons name="call-outline" size={24} color="#3B82F6" />
            <Text className="ml-3 text-lg font-bold text-gray-800">Contact Details</Text>
          </View>

          <Text className="text-sm text-gray-600 mb-1">Phone Number</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 bg-white text-base"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone Number"
            keyboardType="phone-pad"
          />

          <Text className="text-sm text-gray-600 mb-1">Email Address</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 bg-white text-base"
            value={emailAddress}
            onChangeText={setEmailAddress}
            placeholder="Email Address"
            keyboardType="email-address"
          />

          <Text className="text-sm text-gray-600 mb-1">Address Line 1</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 bg-white text-base"
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="Address Line 1"
          />

          <Text className="text-sm text-gray-600 mb-1">Address Line 2 (Optional)</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 bg-white text-base"
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Address Line 2 (Optional)"
          />

          <Text className="text-sm text-gray-600 mb-1">City</Text>
          <View className="relative">
            <TouchableOpacity onPress={() => setShowCityPicker(true)} className="flex-row items-center justify-between border border-gray-300 rounded-md p-3 mb-4 bg-white">
              <Text className="text-base text-gray-700">{city}</Text>
              <Ionicons name="chevron-down" size={20} color="gray" />
            </TouchableOpacity>
            {showCityPicker && (
              <View className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md z-50" style={{ bottom: '100%', maxHeight: 200, marginBottom: 4 }}>
                <ScrollView nestedScrollEnabled={true}>
                  {sriLankanCities.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      className="p-3 border-b border-gray-200"
                      onPress={() => {
                        setCity(item);
                        setShowCityPicker(false);
                      }}
                    >
                      <Text className="text-base text-gray-700">{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </PrimaryCard>

        {/* Save Profile Button */}
        <PrimaryButton 
          title={saving ? "Saving..." : "Save Profile"} 
          onPress={handleSaveProfile} 
          className="mb-4"
          disabled={saving || loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalInformation;
