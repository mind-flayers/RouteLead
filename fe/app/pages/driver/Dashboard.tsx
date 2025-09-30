import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import DriverBottomNavigation from '@/components/navigation/DriverBottomNavigation';
import { ProfileAvatar } from '@/components/ui/ProfileImage';
import { useEarningsData, useDriverInfo } from '@/hooks/useEarningsData';
import { useMultipleLocationDescriptions } from '@/hooks/useLocationDescription';
import { formatCurrency, formatDateTime, getRouteDescription, EarningsHistory, testApiConnection } from '@/services/apiService';
import { WithdrawalAPI } from '@/services/withdrawalService';

const Dashboard = () => {
  const router = useRouter();
  
  // Get driver information
  const { driverId, driverName, loading: driverLoading } = useDriverInfo();
  
  // State for available balance (withdrawal balance)
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(true);
  
  // Get earnings data using the custom hook
  const {
    summary,
    history,
    pendingBids,
    completedRoutes,
    loading: earningsLoading,
    error,
    refreshing,
    refreshData,
    getPercentageChange,
  } = useEarningsData(driverId);

  useEffect(() => {
    testApiConnection();
  }, []);

  // Fetch available balance from withdrawal service
  const fetchAvailableBalance = async () => {
    if (!driverId) return;
    
    try {
      setBalanceLoading(true);
      const balanceData = await WithdrawalAPI.getAvailableBalance(driverId);
      setAvailableBalance(balanceData.availableBalance);
    } catch (error) {
      console.error('Error fetching available balance:', error);
      // Fallback to earnings summary balance if withdrawal balance fails
      if (summary) {
        setAvailableBalance(summary.availableBalance);
      }
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch balance when driverId is available
  useEffect(() => {
    if (driverId) {
      fetchAvailableBalance();
    }
  }, [driverId]);

  // Refresh balance when earnings data is refreshed
  useEffect(() => {
    if (!refreshing && driverId) {
      fetchAvailableBalance();
    }
  }, [refreshing, driverId]);

  // Memoized KPI data based on real API data
  const kpiData = useMemo(() => {
    if (!summary) {
      // Loading state with placeholder values
      return [
        {
          title: "Today's\nEarnings",
          icon: <FontAwesome5 name="wallet" size={20} color="#f97316" />,
          value: "Loading...",
          subtext: "Fetching data..."
        },
        {
          title: "Active Routes",
          icon: <FontAwesome5 name="route" size={20} color="#f97316" />,
          value: "...",
          subtext: "Loading routes..."
        },
        {
          title: "Weekly Total\nEarnings",
          icon: <FontAwesome5 name="dollar-sign" size={20} color="#f97316" />,
          value: "Loading...",
          subtext: "Calculating..."
        },
        {
          title: "Available\nBalance",
          icon: <FontAwesome5 name="money-bill-wave" size={20} color="#f97316" />,
          value: "Loading...",
          subtext: "Calculating balance..."
        }
      ];
    }

    // Calculate percentage changes (using mock comparison for now)
    const todayChange = getPercentageChange(summary.todayEarnings, summary.todayEarnings * 0.9);
    const weeklyChange = getPercentageChange(summary.weeklyEarnings, summary.weeklyEarnings * 0.92);

    return [
      {
        title: "Today's\nEarnings",
        icon: <FontAwesome5 name="wallet" size={20} color="#f97316" />,
        value: formatCurrency(summary.todayEarnings),
        subtext: `${todayChange >= 0 ? '+' : ''}${(todayChange || 0).toFixed(1)}% from yesterday`
      },
      {
        title: "Active Routes",
        icon: <FontAwesome5 name="route" size={20} color="#f97316" />,
        value: (completedRoutes || 0).toString(),
        subtext: "Routes currently active"
      },
      {
        title: "Weekly Total\nEarnings",
        icon: <FontAwesome5 name="dollar-sign" size={20} color="#f97316" />,
        value: formatCurrency(summary.weeklyEarnings),
        subtext: `${weeklyChange >= 0 ? '+' : ''}${(weeklyChange || 0).toFixed(1)}% from last week`
      },
      {
        title: "Available\nBalance",
        icon: <FontAwesome5 name="money-bill-wave" size={20} color="#f97316" />,
        value: balanceLoading ? "Loading..." : formatCurrency(availableBalance),
        subtext: "Ready for withdrawal"
      }
    ];
  }, [summary, pendingBids, getPercentageChange, availableBalance, balanceLoading]);

  // Get the most recent 3 earnings entries for geocoding
  const recentEarnings = useMemo(() => {
    if (!history.length) return [];
    
    return history
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 3);
  }, [history]);

  // Use geocoding hook for location descriptions
  const locationDescriptions = useMultipleLocationDescriptions(recentEarnings);

  // Memoized recent activities from earnings history
  const recentActivities = useMemo(() => {
    if (!recentEarnings.length) return [];
    
    return recentEarnings.map((earning, index) => {
      const locationDesc = locationDescriptions[index];
      
      return {
        id: earning.id,
        type: 'route_completion',
        title: 'Route Completion:',
        subtitle: locationDesc?.description || getRouteDescription(earning),
        amount: earning.netAmount,
        date: formatDateTime(earning.earnedAt),
        icon: <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#3b82f6" />,
        iconBg: 'bg-blue-100',
        amountColor: 'text-green-600',
        earning,
        isLoadingLocation: locationDesc?.isLoading || false,
      };
    });
  }, [recentEarnings, locationDescriptions]);

  // Handle earnings status update
  const handleStatusUpdate = async (earningsId: string, newStatus: 'AVAILABLE' | 'WITHDRAWN') => {
    try {
      // await updateEarningsStatus(earningsId, newStatus);
      Alert.alert('Success', `Earnings status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update earnings status');
    }
  };

  // Handle refresh
  const onRefresh = () => {
    refreshData();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Link href="/pages/driver/Notifications" className="items-center">
          <Ionicons name="notifications-outline" size={24} color="black" />
        </Link>
        <Text className="text-xl font-bold text-gray-900">Dashboard</Text>
        <Link href="/pages/driver/Profile" className="items-center">
          <View className="flex-row items-center">
            <ProfileAvatar 
              useCurrentUser={true}
              size={32}
              className="mr-2"
            />
          </View>
        </Link>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View className="mb-4 items-center">
          <Text className="text-2xl font-bold mb-1">
            Welcome, {driverLoading ? 'Loading...' : driverName || 'Driver'}!
          </Text>
          <Text className="text-gray-600">Ready for your next route?</Text>
          {error && (
            <Text className="text-red-500 text-sm mt-2">
              {error}
            </Text>
          )}
        </View>

        {/* Post New Route Button */}
        <PrimaryButton
          title="Post New Route"
          onPress={() => router.push('/pages/driver/create_route/CreateRoute')}
          style={{ marginBottom: 24 }}
        />

        {/* Key Performance Indicators */}
        <Text className="text-xl font-bold mb-4">Key Performance Indicators</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          {kpiData.map((item, index) => (
            <View 
              key={index} 
              className="w-[48%] bg-orange-50 p-4 rounded-2xl border border-orange-300 flex flex-col justify-between mb-4"
              style={{ minHeight: 150 }} // Ensures consistent card height
            >
              <View className="flex-row justify-between items-start">
                <Text className="text-gray-800 text-base font-medium">{item.title}</Text>
                <View className="bg-orange-200 p-2 rounded-lg">
                  {item.icon}
                </View>
              </View>
              <View>
                <Text className="text-orange-500 text-2xl font-bold">{item.value}</Text>
                <Text className="text-gray-500 text-sm mt-1">{item.subtext}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Route Activity Overview */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold">Recent Activities</Text>
          <TouchableOpacity 
            onPress={() => router.push('/pages/driver/MyEarnings')}
            className="flex-row items-center"
          >
            <Text className="text-orange-500 font-medium mr-1">View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#f97316" />
          </TouchableOpacity>
        </View>
        {earningsLoading ? (
          <View className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <Text className="text-gray-500 text-center">Loading activities...</Text>
          </View>
        ) : recentActivities.length > 0 ? (
          <View className="space-y-4">
            {recentActivities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                onPress={() => {
                  // Navigate to earnings detail or show more info
                  Alert.alert(
                    'Earnings Details',
                    `Amount: ${formatCurrency(activity.amount)}\nStatus: ${activity.earning.status}\nCustomer: ${activity.earning.customerName || 'N/A'}`,
                    [
                      { text: 'OK' },
                      ...(activity.earning.status === 'PENDING' ? [{
                        text: 'Mark Available',
                        onPress: () => handleStatusUpdate(activity.id, 'AVAILABLE')
                      }] : [])
                    ]
                  );
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className={`${activity.iconBg} p-3 rounded-full mr-3`}>
                      {activity.icon}
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800">{activity.title}</Text>
                      <View className="flex-row items-center">
                        <Text className="text-gray-700 mb-1 flex-1">{activity.subtitle}</Text>
                        {activity.isLoadingLocation && (
                          <View className="ml-2 flex-row items-center">
                            <Text className="text-xs text-gray-500 mr-1">Loading...</Text>
                            <Ionicons name="refresh" size={12} color="#9CA3AF" />
                          </View>
                        )}
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-500 text-sm">{activity.date}</Text>
                        <View className="flex-row items-center">
                          <Text className={`${activity.amountColor} font-bold mr-2`}>
                            +{formatCurrency(activity.amount)}
                          </Text>
                          <View className={`px-2 py-1 rounded-full ${
                            activity.earning.status === 'AVAILABLE' ? 'bg-green-100' :
                            activity.earning.status === 'PENDING' ? 'bg-yellow-100' : 'bg-gray-100'
                          }`}>
                            <Text className={`text-xs font-medium ${
                              activity.earning.status === 'AVAILABLE' ? 'text-green-800' :
                              activity.earning.status === 'PENDING' ? 'text-yellow-800' : 'text-gray-800'
                            }`}>
                              {activity.earning.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <View className="items-center">
              <MaterialCommunityIcons name="truck-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-2">No recent activities</Text>
              <Text className="text-gray-400 text-center text-sm">Complete your first route to see activities here</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-20 right-6 bg-orange-500 p-4 rounded-full shadow-lg mb-4"
        onPress={() => router.push('/pages/driver/DeliveryManagement')}
        style={{
          zIndex: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.30,
          shadowRadius: 4.65,
          elevation: 8,
        }}
      >
        <Ionicons name="car-outline" size={30} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <DriverBottomNavigation />
    </SafeAreaView>
  );
};

export default Dashboard;
