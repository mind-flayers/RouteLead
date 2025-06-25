import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const sriLankanCities = [
  'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Batticaloa', 'Trincomalee', 'Anuradhapura',
  'Polonnaruwa', 'Nuwara Eliya', 'Ratnapura', 'Badulla', 'Matara', 'Kurunegala', 'Kegalle',
  'Kalutara', 'Mannar', 'Vavuniya', 'Kilinochchi', 'Ampara', 'Monaragala', 'Hambantota',
  'Puttalam', 'Chilaw', 'Panadura', 'Moratuwa', 'Dehiwala-Mount Lavinia', 'Sri Jayawardenepura Kotte',
];

const PersonalInformation = () => {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('Mishaf');
  const [lastName, setLastName] = useState('Hasan');
  const [dateOfBirth, setDateOfBirth] = useState(new Date('2000-05-15'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('Female');
  const [nicNumber, setNicNumber] = useState('123456789');
  const [phoneNumber, setPhoneNumber] = useState('0781234567');
  const [emailAddress, setEmailAddress] = useState('example@example.com');
  const [addressLine1, setAddressLine1] = useState('123 Main Street');
  const [addressLine2, setAddressLine2] = useState('Nogegoda');
  const [city, setCity] = useState('Colombo');
  const [showCityPicker, setShowCityPicker] = useState(false);

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

  const handleSaveProfile = () => {
    console.log('Profile Saved:', {
      firstName, lastName, dateOfBirth, gender, nicNumber,
      phoneNumber, emailAddress, addressLine1, addressLine2, city,
    });
    // Add actual save logic have to build
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
            <Text className="ml-3 text-base text-gray-700">{dateOfBirth.toDateString()}</Text>
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
          <TouchableOpacity onPress={() => console.log('Open Gender Picker')} className="flex-row items-center justify-between border border-gray-300 rounded-md p-3 mb-4 bg-white">
            <Text className="text-base text-gray-700">{gender}</Text>
            <Ionicons name="chevron-down" size={20} color="gray" />
          </TouchableOpacity>
          {/* Gender picker implementation would go here, e.g., using a modal or a custom component */}

          <Text className="text-sm text-gray-600 mb-1">NIC Number</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 bg-white text-base"
            value={nicNumber}
            onChangeText={setNicNumber}
            placeholder="NIC Number"
            keyboardType="numeric"
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

          <Text className="text-sm text-gray-600 mb-1">Address Line 2</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4 bg-white text-base"
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Address Line 2"
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
        <PrimaryButton title="Save Profile" onPress={handleSaveProfile} className="mb-4" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalInformation;
