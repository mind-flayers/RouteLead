import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

const ChatList = () => {
  const router = useRouter();

  const chatData = [
    {
      id: '1',
      name: 'Kasun Perera',
      lastMessage: 'Parcel has been successful',
      time: 'Just now',
      unreadCount: 1,
      profileImage: 'profile_placeholder',
    },
    {
      id: '2',
      name: 'Sanjika J',
      lastMessage: 'We are interested in your r',
      time: 'Yesterday',
      unreadCount: 3,
      profileImage: 'profile_placeholder',
    },
    {
      id: '3',
      name: 'Christan Cone',
      lastMessage: 'When will the delivery arrive',
      time: 'Monday',
      unreadCount: 0,
      profileImage: 'profile_placeholder',
    },
    {
      id: '4',
      name: 'Nithushan M',
      lastMessage: 'How do I update my vehicle de',
      time: 'Jan 5',
      unreadCount: 0,
      profileImage: 'profile_placeholder',
    },
    {
      id: '5',
      name: 'Karun Wickramasinghe',
      lastMessage: 'Confirming the pickup tim',
      time: '2 days ago',
      unreadCount: 0,
      profileImage: 'profile_placeholder',
    },
    {
      id: '6',
      name: 'Pratheepan Sam',
      lastMessage: 'We have submitted a new bid',
      time: 'Last week',
      unreadCount: 0,
      profileImage: 'profile_placeholder',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Link href="/pages/driver/Notifications" className="items-center">
          <Ionicons name="notifications-outline" size={24} color="black" />
        </Link>
        <Text className="text-xl font-bold">Chat</Text>
        <Link href="/pages/driver/Profile" className="items-center">
          <View className="flex-row items-center">
            <Image
              source={require('../../../assets/images/profile_placeholder.jpeg')}
              className="w-8 h-8 rounded-full mr-2"
            />
          </View>
        </Link>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Search Input */}
        <View className="mb-4 flex-row items-center bg-gray-100 rounded-xl px-3">
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            className="flex-1 p-2 text-base ml-2"
            placeholder="Search conversations..."
            placeholderTextColor="#888"
          />
        </View>

        {/* Inbox/Archived Tabs */}
        <View className="flex-row mb-4 bg-gray-100 rounded-xl p-1">
          <TouchableOpacity className="flex-1 py-2 rounded-lg bg-white shadow-sm">
            <Text className="text-center font-semibold text-orange-500">Inbox</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-2 rounded-lg">
            <Text className="text-center font-semibold text-gray-600">Archived</Text>
          </TouchableOpacity>
        </View>

        {/* Chat List */}
        <View className="space-y-3">
          {chatData.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              className="flex-row items-center p-3 bg-white rounded-xl shadow-sm border border-gray-200"
              onPress={() => router.push({ pathname: '/pages/driver/ChatScreen', params: { name: chat.name, profileImage: chat.profileImage } as any })}
            >
              <Image
                source={chat.profileImage === 'profile_placeholder' ? require('../../../assets/images/profile_placeholder.jpeg') : { uri: chat.profileImage }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="font-bold text-base">{chat.name}</Text>
                <Text className="text-gray-600 text-sm" numberOfLines={1}>{chat.lastMessage}</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-500 text-xs mb-1">{chat.time}</Text>
                {chat.unreadCount > 0 && (
                  <View className="bg-orange-500 rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-xs font-bold">{chat.unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
              <Ionicons name="chatbubbles" size={22} color="#F97316" />
              <Text className="text-orange-500 text-xs mt-1" numberOfLines={1}>Chats</Text>
            </View>
          </TouchableOpacity>
        </Link>
        <Link href="/pages/driver/Profile" asChild>
          <TouchableOpacity className="flex-1 items-center justify-center py-1" style={{ minHeight: 56 }}>
            <View className="items-center justify-center">
              <Ionicons name="person" size={22} color="gray" />
              <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>Profile</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default ChatList;
