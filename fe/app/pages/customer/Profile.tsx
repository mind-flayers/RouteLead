import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../../lib/auth';

export default function ProfilePage() {
    const { user } = useAuth();

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-4">Profile</Text>
      </View>

      {/* Avatar & Name */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 rounded-full bg-orange-200 mb-4" />
        <Text className="text-xl font-semibold text-black">
  {user?.firstName} {user?.lastName}
</Text>
      </View>

      
      <SectionHeader title="Account" />
      <View className="mb-6">
        <ProfileRow icon="mail-outline" label="Email" value="sophia.carter@email.com" />
        <ProfileRow icon="call-outline" label="Phone" value="+1 (555) 123–4567" />
      </View>

  
      <SectionHeader title="Payment" />
      <View className="mb-6">
        <ProfileRow icon="card-outline" label="Payment Method" value="Visa •••• 1234" />
      </View>

      {/* Section: Address Book */}
      <SectionHeader title="Address Book" />
      <View className="mb-6">
        <ProfileRow icon="home-outline" label="Home" value="123 Main St, Anytown, USA" />
        <ProfileRow icon="briefcase-outline" label="Work" value="456 Oak Ave, Anytown, USA" />
      </View>

      {/* Section: Delivery History */}
      <SectionHeader title="Delivery History" />
      <View className="mb-6">
        <ProfileRow icon="time-outline" label="View Past Deliveries" />
      </View>

      {/* Section: Settings */}
      <SectionHeader title="Settings" />
      <View className="mb-12">
        <ProfileRow icon="notifications-outline" label="Notifications" />
        <ProfileRow icon="settings-outline" label="App Preferences" />
      </View>
    </ScrollView>
  );
}

type ProfileRowProps = {
  icon: string;
  label: string;
  value?: string;
};

function ProfileRow({ icon, label, value }: ProfileRowProps) {
  return (
    <View className="flex-row items-start mb-4">
      <Ionicons name={icon} size={20} color="#444" style={{ marginTop: 2, marginRight: 16 }} />
      <View className="flex-1">
        <Text className="text-base font-medium text-black">{label}</Text>
        {value && <Text className="text-sm text-gray-500 mt-1">{value}</Text>}
      </View>
    </View>
  );
}

type SectionHeaderProps = {
  title: string;
};

function SectionHeader({ title }: SectionHeaderProps) {
  return <Text className="text-sm text-gray-500 mb-2">{title}</Text>;
}
