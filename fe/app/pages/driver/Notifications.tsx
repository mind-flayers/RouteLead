import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import { useNavigation } from '@react-navigation/native';

const Notifications = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const notificationsData = [
    {
      id: '1',
      type: 'New Bid Received',
      description: 'A new bid of LKR 120 for load #RLD5678 has been placed. Review now to',
      time: 'Just now',
      icon: 'hammer', // FontAwesome5 for bid/auction
      read: false,
    },
    {
      id: '2',
      type: 'Payment Processed',
      description: 'Your payment of LKR 350 for completed delivery #RLD1234 has been',
      time: '5 min ago',
      icon: 'dollar-sign', // FontAwesome5 for money
      read: false,
    },
    {
      id: '3',
      type: 'New Message from Support',
      description: 'You have a new message from RouteLead Support regarding your',
      time: '15 min ago',
      icon: 'comment-alt', // FontAwesome5 for message
      read: false,
    },
    {
      id: '4',
      type: 'Delivery Update: En Route',
      description: 'Your next pickup for load #RLD6789 is confirmed and you are now en route to',
      time: '30 min ago',
      icon: 'bell', // Ionicons for notification/update
      read: true,
    },
    {
      id: '5',
      type: 'Withdrawal Completed',
      description: 'Your withdrawal request for LKR 1000 has been successfully processed and',
      time: '1 hr ago',
      icon: 'check-circle', // FontAwesome5 for completed/check
      read: true,
    },
    {
      id: '6',
      type: 'Weekend Bonus Alert!',
      description: 'Earn an extra LKR 50 for completing 3 deliveries this weekend. Tap to learn',
      time: 'Yesterday',
      icon: 'bell', // Ionicons for notification/alert
      read: false,
    },
    {
      id: '7',
      type: 'Bid Rejected',
      description: 'Your bid for load #RLD3456 has been rejected. Consider adjusting your offer',
      time: 'Yesterday',
      icon: 'hammer', // FontAwesome5 for bid/auction
      read: true,
    },
    {
      id: '8',
      type: 'Load #RLD7890 Chat',
      description: 'A message from the dispatcher regarding the updated delivery window',
      time: '2 days ago',
      icon: 'comment-alt', // FontAwesome5 for chat
      read: true,
    },
    {
      id: '9',
      type: 'Invoice Available',
      description: 'Your monthly invoice for all completed loads in November is now available for',
      time: '3 days ago',
      icon: 'dollar-sign', // FontAwesome5 for invoice/money
      read: true,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Top Bar */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">Notifications</Text>
        <View className="w-10" />{/* Placeholder for alignment */}
      </View>

      <ScrollView className="flex-1 p-4">
        <PrimaryButton title="Mark all as read" onPress={() => console.log('Mark all as read')} />

        <View className="mt-4">
          {notificationsData.map((notification) => (
            <PrimaryCard key={notification.id} className="mb-3 p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3 relative">
                {notification.icon === 'hammer' && <FontAwesome5 name="hammer" size={20} color="#3B82F6" />}
                {notification.icon === 'dollar-sign' && <FontAwesome5 name="dollar-sign" size={20} color="#3B82F6" />}
                {notification.icon === 'comment-alt' && <FontAwesome5 name="comment-alt" size={20} color="#3B82F6" />}
                {notification.icon === 'bell' && <Ionicons name="notifications" size={20} color="#3B82F6" />}
                {notification.icon === 'check-circle' && <FontAwesome5 name="check-circle" size={20} color="#3B82F6" />}
                {!notification.read && (
                  <View className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-blue-600 mb-1">{notification.type}</Text>
                <Text className="text-gray-700 text-sm mb-1">{notification.description}</Text>
                <Text className="text-gray-500 text-xs">{notification.time}</Text>
              </View>
            </PrimaryCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;
