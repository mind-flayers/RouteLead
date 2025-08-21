import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, Animated, Image } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth';
import { router } from 'expo-router';
import CustomerFooter from '../../../components/navigation/CustomerFooter';
import { LinearGradient } from 'expo-linear-gradient';

// Animated Gradient Background Component
const AnimatedGradientBackground = ({ children }: { children: React.ReactNode }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1250, // Faster speed (8x faster than before)
        useNativeDriver: false,
      })
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const animatedOpacity = animatedValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0.85, 1, 0.9, 1, 0.85], // More dynamic opacity changes
  });

  const animatedScale = animatedValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 1.02, 1.03, 1.02, 1], // Subtle scale with higher amplitude
  });



  const colors: string[] = ['#554226', '#03162D', '#002027', '#020210', '#02152A'] as const;

  return (
    <Animated.View style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
               <Animated.View
           style={{
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             borderRadius: 16,
             opacity: animatedOpacity,
             transform: [
               { scale: animatedScale }
             ],
           }}
         >
        <LinearGradient
          colors={colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: 16,
          }}
        />
      </Animated.View>
      <View style={{ flex: 1, padding: 24 }}>
        {children}
      </View>
    </Animated.View>
  );
};

const actions = [
  {
    label: 'Find a Route',
    subtitle: 'Search for available routes',
    icon: <FontAwesome name="search" size={24} color="#fff" />,
    active: true,
    route: '/pages/customer/FindRoute',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    label: 'My Bids',
    subtitle: 'View your parcel requests',
    icon: <FontAwesome name="dollar" size={24} color="#fff" />,
    active: true,
    route: '/pages/customer/MyBids', 
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  {
    label: 'Track Deliveries',
    subtitle: 'Monitor active deliveries',
    icon: <MaterialIcons name="local-shipping" size={24} color="#fff" />,
    active: true,
    route: '/pages/customer/TrackingDelivery', 
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  {
    label: 'Past Deliveries',
    subtitle: 'View completed deliveries',
    icon: <Ionicons name="time-outline" size={24} color="#fff" />,
    active: true, 
    route: '/pages/customer/MyBids',
    params: { filter: 'DELIVERED' },
    color: '#8B5CF6',
    bgColor: '#F3F4F6',
  },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const userName = user?.firstName || 'Customer';

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
                 {/* Logo Header */}
         <View className="bg-white px-6 pt-6 pb-4 border-b border-gray-100">
           <View className="flex-row justify-between items-center">
             <View className="flex-1">
               <Image 
                 source={require('../../../assets/images/logo_text.png')}
                 style={{ 
                   width: 140, 
                   height: 32, 
                   resizeMode: 'contain' 
                 }}
               />
             </View>
             <View className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 items-center justify-center shadow-sm">
               <Text className="text-white font-bold text-lg">
                 {userName.charAt(0).toUpperCase()}
               </Text>
             </View>
           </View>
         </View>

         {/* Welcome Message */}
         <View className="bg-white px-6 py-4">
           <View className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
             <View className="flex-row items-center">
               <View className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center mr-3">
                 <FontAwesome name="hand-peace-o" size={18} color="#fff" />
               </View>
               <View className="flex-1">
                 <Text className="text-lg font-semibold text-orange-900">Welcome back!</Text>
                 <Text className="text-orange-700 text-sm">Great to see you, {userName}</Text>
               </View>
               <View className="w-8 h-8 rounded-full bg-orange-200 items-center justify-center">
                 <FontAwesome name="smile-o" size={14} color="#F97316" />
               </View>
             </View>
           </View>
         </View>

        {/* Hero Section - Find a Route */}
        <View className="px-6 py-6">
          <AnimatedGradientBackground>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white mb-2">Find Your Perfect Route</Text>
                <Text className="text-orange-100 text-base">
                  Connect with reliable drivers and get competitive bids for your deliveries
                </Text>
              </View>
              <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center ml-4">
                <FontAwesome name="search" size={28} color="#fff" />
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.9}
              className="bg-white rounded-xl py-4 px-6 shadow-sm"
              onPress={() => router.push('/pages/customer/FindRoute')}
            >
              <View className="flex-row items-center justify-center">
                <FontAwesome name="search" size={18} color="#F97316" />
                <Text className="text-orange-600 font-bold text-lg ml-2">Start Finding Routes</Text>
                <Ionicons name="arrow-forward" size={18} color="#F97316" className="ml-2" />
              </View>
            </TouchableOpacity>
          </AnimatedGradientBackground>
        </View>

        {/* Other Actions */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Other Actions</Text>
          <View className="space-y-3">
                         {actions.slice(1).map((action, idx) => (
               <TouchableOpacity
                 key={action.label}
                 activeOpacity={0.8}
                 className="bg-gradient-to-r from-orange-50 to-white rounded-xl p-4 shadow-sm border border-orange-100"
                 onPress={() => {
                   if (action.route) {
                     if (action.params) {
                       router.push({
                         pathname: action.route as any,
                         params: action.params
                       });
                     } else {
                       router.push(action.route as any);
                     }
                   }
                 }}
               >
                 <View className="flex-row items-center">
                   <View 
                     className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                     style={{ backgroundColor: action.bgColor }}
                   >
                     <View 
                       className="w-8 h-8 rounded-lg items-center justify-center"
                       style={{ backgroundColor: action.color }}
                     >
                       {action.icon}
                     </View>
                   </View>
                   <View className="flex-1">
                     <Text className="text-base font-semibold text-gray-900">{action.label}</Text>
                     <Text className="text-sm text-gray-600">{action.subtitle}</Text>
                   </View>
                   <Ionicons name="chevron-forward" size={20} color="#F97316" />
                 </View>
               </TouchableOpacity>
             ))}
          </View>
        </View>

        {/* Quick Tips */}
        <View className="px-6 py-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</Text>
          <View className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-3 mt-1">
                <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-orange-900 mb-1">Pro Tip</Text>
                <Text className="text-sm text-orange-800">
                  Book your deliveries in advance to get better rates and ensure availability!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <CustomerFooter activeTab="home" />
    </View>
  );
}
