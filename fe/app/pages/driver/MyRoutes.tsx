import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import EditButton from '@/components/ui/EditButton';
import DeleteButton from '@/components/ui/DeleteButton';
import PrimaryCard from '@/components/ui/PrimaryCard';
import IndigoButton from '@/components/ui/IndigoButton';

const MyRoutes = () => {
  const router = useRouter();

  // Dummy data for routes
  const routesData = [
    {
      id: '1',
      origin: 'Colombo',
      destination: 'Badulla',
      status: 'Active',
      date: 'Oct 26, 2025',
      timer: '02 D | 02:56:48 H',
      bids: 7,
      highestBid: 'LKR 250.00',
    },
    {
      id: '2',
      origin: 'Badulla',
      destination: 'Colombo',
      status: 'Active',
      date: 'Oct 26, 2025',
      timer: '02 D | 02:56:48 H',
      bids: 7,
      highestBid: 'LKR 250.00',
    },
    {
      id: '3',
      origin: 'Kandy',
      destination: 'Jaffna',
      status: 'Active',
      date: 'Oct 26, 2025',
      timer: '02 D | 02:56:48 H',
      bids: 7,
      highestBid: 'N/A',
    },
    {
      id: '4',
      origin: 'Galle',
      destination: 'Kandy',
      status: 'Expired',
      date: 'Sep 15, 2025',
      bids: 0,
      highestBid: 'LKR 1300.00',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Link href="/pages/driver/Notifications" className="items-center">
          <Ionicons name="notifications-outline" size={24} color="black" />
        </Link>
        <Text className="text-xl font-bold">My Routes</Text>
        <Link href="/pages/driver/Profile" className="items-center">
          <View className="flex-row items-center">
            <Image
              source={require('../../../assets/images/profile_placeholder.jpeg')}
              className="w-8 h-8 rounded-full mr-2"
            />
          </View>
        </Link>
      </View>

      {/* Filter Buttons Section */}
      <View className="flex-row justify-around p-4 bg-white border-b border-gray-200">
        <IndigoButton
          title="Active Routes"
          onPress={() => console.log('Active Routes')}
          style={{ flex: 1, marginRight: 8, paddingVertical: 10, paddingHorizontal: 16 }}
          textStyle={{ fontSize: 16 }}
        />
        <SecondaryButton
          title="Past Routes"
          onPress={() => console.log('Past Routes')}
          style={{ flex: 1, marginLeft: 8, paddingVertical: 10, paddingHorizontal: 16 }}
          textStyle={{ fontSize: 16 }}
        />
      </View>

      {/* Scrollable Content Section */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {routesData.map((route) => (
          <PrimaryCard key={route.id} style={{ marginBottom: 16 }}>
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={18} color="gray" />
              <Text className="text-lg font-semibold ml-2">{route.origin}</Text>
              <View className={`ml-auto px-3 py-1 rounded-full ${route.status === 'Active' ? 'bg-orange-100' : 'bg-red-100'}`}>
                <Text className={`text-xs font-bold ${route.status === 'Active' ? 'text-orange-600' : 'text-red-600'}`}>
                  {route.status}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="arrow-down" size={18} color="gray" style={{ marginLeft: 2 }} />
              <Text className="text-lg font-semibold ml-2">{route.destination}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar-outline" size={18} color="gray" />
              <Text className="text-gray-600 ml-2">{route.date}</Text>
            </View>
            {route.status === 'Active' && (
              <View className="flex-row items-center mb-2">
                <Ionicons name="time-outline" size={18} color="gray" />
                <Text className="text-gray-600 ml-2">{route.timer}</Text>
              </View>
            )}
            <View className="flex-row items-center mb-4">
              <Ionicons name="people-outline" size={18} color="gray" />
              <Text className="text-gray-600 ml-2">{route.bids} Bids | Highest: </Text>
              <Text className="text-orange-500 font-bold">{route.highestBid}</Text>
            </View>
            <View className="flex-row justify-between">
              {route.status === 'Active' ? (
                <>
                  <PrimaryButton
                    title="View Bids"
                    onPress={() => router.push('/pages/driver/ViewBids')} // Assuming a ViewRoute screen
                // style={{ flex: 1, marginRight: 8, paddingVertical: 6, paddingHorizontal: 10 }}
                textStyle={{ fontSize: 12 }}
                  />
                  <EditButton
                    title="Edit"
                    onPress={() => router.push('/pages/driver/create_route/CreateRoute')} // Assuming an EditRoute screen
                    // style={{ flex: 1, marginRight: 8, paddingVertical: 6, paddingHorizontal: 10 }}
                    textStyle={{ fontSize: 12 }}
                  />
                  <DeleteButton
                    title="Delete"
                    onPress={() => console.log('Delete Route', route.id)}
                    // style={{ flex: 1, paddingVertical: 6, paddingHorizontal: 10 }}
                    textStyle={{ fontSize: 12 }}
                  />
                </>
              ) : (
                <PrimaryButton
                  title="View Bids"
                  onPress={() => router.push('/pages/driver/ViewBids')} // Assuming a ViewRoute screen
                  style={{ flex: 1, paddingVertical: 6, paddingHorizontal: 10 }}
                  textStyle={{ fontSize: 12 }}
                />
              )}
            </View>
          </PrimaryCard>
        ))}
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
              <MaterialCommunityIcons name="truck-delivery" size={22} color="#F97316" />
              <Text className="text-orange-500 text-xs mt-1" numberOfLines={1}>Routes</Text>
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
              <Ionicons name="person" size={22} color="gray" />
              <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>Profile</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default MyRoutes;
