import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import PrimaryCard from '@/components/ui/PrimaryCard';
import WithdrawalHistoryCard from '@/components/ui/WithdrawalHistoryCard';
import PaymentPreferencesModal from '@/components/ui/PaymentPreferencesModal';
import DriverBottomNavigation from '@/components/navigation/DriverBottomNavigation';
import { useEarningsData, useDriverInfo } from '@/hooks/useEarningsData';
import { useMultipleLocationDescriptions } from '@/hooks/useLocationDescription';
import { formatCurrency, formatDateTime, getRouteDescription, EarningsHistory } from '@/services/apiService';
import { WithdrawalAPI, WithdrawalHistory, BankDetailsAPI } from '@/services/withdrawalService';

type TabType = 'earnings' | 'withdrawals';
type EarningsFilterType = 'ALL' | 'PENDING' | 'AVAILABLE' | 'WITHDRAWN';
type WithdrawalsFilterType = 'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

const MyEarnings = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('earnings');
  const [selectedEarningsFilter, setSelectedEarningsFilter] = useState<EarningsFilterType>('ALL');
  const [selectedWithdrawalsFilter, setSelectedWithdrawalsFilter] = useState<WithdrawalsFilterType>('ALL');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Withdrawal data
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [hasBankDetails, setHasBankDetails] = useState(false);
  
  // Get driver information and earnings data
  const { driverId } = useDriverInfo();
  const {
    summary,
    history,
    loading,
    error,
    refreshing,
    refreshData,
    updateEarningsStatus,
    getEarningsByStatus,
  } = useEarningsData(driverId);

  // Load withdrawal data when tab changes
  useEffect(() => {
    if (activeTab === 'withdrawals' && driverId) {
      loadWithdrawalData();
    }
  }, [activeTab, driverId]);

  // Load available balance when component mounts
  useEffect(() => {
    if (driverId) {
      loadAvailableBalance();
      checkBankDetails();
    }
  }, [driverId]);

  const loadWithdrawalData = async () => {
    setWithdrawalLoading(true);
    try {
      const history = await WithdrawalAPI.getWithdrawalHistory(driverId);
      setWithdrawalHistory(history);
    } catch (error) {
      console.error('Error loading withdrawal history:', error);
      Alert.alert('Error', 'Failed to load withdrawal history');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const loadAvailableBalance = async () => {
    try {
      const balanceResult = await WithdrawalAPI.getAvailableBalance(driverId);
      setAvailableBalance(balanceResult.availableBalance);
    } catch (error) {
      console.error('Error loading available balance:', error);
    }
  };

  const checkBankDetails = async () => {
    try {
      const bankDetails = await BankDetailsAPI.getBankDetails(driverId);
      setHasBankDetails(!!bankDetails);
    } catch (error) {
      console.error('Error checking bank details:', error);
    }
  };

  // Filter earnings based on selected status
  const filteredEarnings = useMemo(() => {
    if (selectedEarningsFilter === 'ALL') return history;
    return getEarningsByStatus(selectedEarningsFilter);
  }, [history, selectedEarningsFilter, getEarningsByStatus]);

  // Filter withdrawals based on selected status
  const filteredWithdrawals = useMemo(() => {
    if (selectedWithdrawalsFilter === 'ALL') return withdrawalHistory;
    return withdrawalHistory.filter(w => w.status === selectedWithdrawalsFilter);
  }, [withdrawalHistory, selectedWithdrawalsFilter]);

  // Use geocoding hook for location descriptions
  const locationDescriptions = useMultipleLocationDescriptions(filteredEarnings);

  // Handle status update
  const handleStatusUpdate = async (earningsId: string, newStatus: 'AVAILABLE' | 'WITHDRAWN') => {
    try {
      await updateEarningsStatus(earningsId, newStatus);
      Alert.alert('Success', `Earnings status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update earnings status');
    }
  };

  // Handle withdrawal navigation
  const handleWithdrawFunds = () => {
    if (!hasBankDetails) {
      Alert.alert(
        'Bank Details Required',
        'Please add your bank details first to proceed with withdrawal.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Bank Details', onPress: () => setShowPaymentModal(true) }
        ]
      );
      return;
    }
    router.push('/pages/driver/WithdrawalForm');
  };

  // Handle withdrawal retry
  const handleRetryWithdrawal = async (withdrawalId: string) => {
    Alert.alert(
      'Retry Withdrawal',
      'This will create a new withdrawal request with the same details.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => {
          // Navigate to withdrawal form
          router.push('/pages/driver/WithdrawalForm');
        }}
      ]
    );
  };

  // Get status badge color
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'WITHDRAWN':
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const earningsFilterOptions: { key: EarningsFilterType; label: string; count: number }[] = [
    { key: 'ALL', label: 'All', count: history.length },
    { key: 'PENDING', label: 'Pending', count: getEarningsByStatus('PENDING').length },
    { key: 'AVAILABLE', label: 'Available', count: getEarningsByStatus('AVAILABLE').length },
    { key: 'WITHDRAWN', label: 'Withdrawn', count: getEarningsByStatus('WITHDRAWN').length },
  ];

  const withdrawalsFilterOptions: { key: WithdrawalsFilterType; label: string; count: number }[] = [
    { key: 'ALL', label: 'All', count: withdrawalHistory.length },
    { key: 'PENDING', label: 'Pending', count: withdrawalHistory.filter(w => w.status === 'PENDING').length },
    { key: 'PROCESSING', label: 'Processing', count: withdrawalHistory.filter(w => w.status === 'PROCESSING').length },
    { key: 'COMPLETED', label: 'Completed', count: withdrawalHistory.filter(w => w.status === 'COMPLETED').length },
    { key: 'FAILED', label: 'Failed', count: withdrawalHistory.filter(w => w.status === 'FAILED').length },
  ];

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <View className="bg-yellow-100 p-3 rounded-full mr-3">
            <MaterialCommunityIcons name="clock-outline" size={24} color="#f59e0b" />
          </View>
        );
      case 'AVAILABLE':
        return (
          <View className="bg-green-100 p-3 rounded-full mr-3">
            <MaterialCommunityIcons name="check-circle-outline" size={24} color="#10b981" />
          </View>
        );
      case 'WITHDRAWN':
        return (
          <View className="bg-blue-100 p-3 rounded-full mr-3">
            <MaterialCommunityIcons name="bank-transfer-out" size={24} color="#3b82f6" />
          </View>
        );
      default:
        return (
          <View className="bg-blue-100 p-3 rounded-full mr-3">
            <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#3b82f6" />
          </View>
        );
    }
  };

  const refreshAllData = async () => {
    await refreshData();
    if (activeTab === 'withdrawals') {
      await loadWithdrawalData();
    }
    await loadAvailableBalance();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Link href="/pages/driver/Notifications" className="items-center">
          <Ionicons name="notifications-outline" size={24} color="black" />
        </Link>
        <Text className="text-xl font-bold">My Earnings</Text>
        <Link href="/pages/driver/Profile" className="items-center">
          <View className="flex-row items-center">
            <Image
              source={require('../../../assets/images/profile_placeholder.jpeg')}
              className="w-8 h-8 rounded-full mr-2"
            />
          </View>
        </Link>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-gray-50 mx-4 mt-4 rounded-lg p-1">
        <TouchableOpacity
          onPress={() => setActiveTab('earnings')}
          className={`flex-1 py-3 rounded-md ${activeTab === 'earnings' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`text-center font-semibold ${activeTab === 'earnings' ? 'text-orange-500' : 'text-gray-600'}`}>
            Earnings History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('withdrawals')}
          className={`flex-1 py-3 rounded-md ${activeTab === 'withdrawals' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`text-center font-semibold ${activeTab === 'withdrawals' ? 'text-orange-500' : 'text-gray-600'}`}>
            Withdrawal History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing || withdrawalLoading} onRefresh={refreshAllData} />
        }
      >
        {/* Summary Cards */}
        <View className="p-4 space-y-4">
          {/* Available Balance Card */}
          <PrimaryCard style={{ marginBottom: 12 }}>
            <Text className="text-gray-600 text-base mb-2">Available for Withdrawal</Text>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <FontAwesome5 name="dollar-sign" size={24} color="#f97316" />
                <Text className="text-3xl font-bold text-gray-800 ml-2">
                  {formatCurrency(availableBalance)}
                </Text>
              </View>
            </View>
            <PrimaryButton
              title={hasBankDetails ? "Withdraw Funds" : "Add Bank Details First"}
              onPress={handleWithdrawFunds}
              icon={<MaterialCommunityIcons name="bank-transfer-out" size={20} color="white" />}
            />
          </PrimaryCard>

          {/* Summary Stats */}
          {summary && (
            <View className="flex-row space-x-3">
              <PrimaryCard style={{ flex: 1, marginBottom: 0 }}>
                <Text className="text-gray-600 text-sm">Total Earned</Text>
                <Text className="text-xl font-bold text-gray-800">
                  {formatCurrency(summary.totalEarnings)}
                </Text>
              </PrimaryCard>
              
              <PrimaryCard style={{ flex: 1, marginBottom: 0 }}>
                <Text className="text-gray-600 text-sm">This Month</Text>
                <Text className="text-xl font-bold text-gray-800">
                  {formatCurrency(summary.monthlyEarnings)}
                </Text>
              </PrimaryCard>
            </View>
          )}
        </View>

        {/* Filter Tabs */}
        <View className="px-4 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {(activeTab === 'earnings' ? earningsFilterOptions : withdrawalsFilterOptions).map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => activeTab === 'earnings' ? 
                  setSelectedEarningsFilter(option.key as EarningsFilterType) : 
                  setSelectedWithdrawalsFilter(option.key as WithdrawalsFilterType)
                }
                className={`mr-3 px-4 py-2 rounded-full border ${
                  (activeTab === 'earnings' && selectedEarningsFilter === option.key) ||
                  (activeTab === 'withdrawals' && selectedWithdrawalsFilter === option.key)
                    ? 'bg-orange-500 border-orange-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`font-medium ${
                    (activeTab === 'earnings' && selectedEarningsFilter === option.key) ||
                    (activeTab === 'withdrawals' && selectedWithdrawalsFilter === option.key)
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {option.label} ({option.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content based on active tab */}
        <View className="px-4">
          {activeTab === 'earnings' ? (
            // Earnings History
            <>
              {loading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#f97316" />
                  <Text className="text-gray-600 mt-2">Loading earnings...</Text>
                </View>
              ) : filteredEarnings.length === 0 ? (
                <View className="items-center py-12">
                  <MaterialCommunityIcons name="cash-off" size={64} color="#9CA3AF" />
                  <Text className="text-xl font-semibold text-gray-600 mt-4">No earnings found</Text>
                  <Text className="text-gray-500 text-center mt-2">
                    {selectedEarningsFilter === 'ALL' 
                      ? "You haven't completed any deliveries yet"
                      : `No ${selectedEarningsFilter.toLowerCase()} earnings found`
                    }
                  </Text>
                </View>
              ) : (
                filteredEarnings.map((earning, index) => {
                  const description = locationDescriptions[earning.id] || getRouteDescription(earning);
                  const statusStyle = getStatusBadgeStyle(earning.status);
                  
                  return (
                    <PrimaryCard key={earning.id} style={{ marginBottom: 12 }}>
                      <View className="flex-row items-center">
                        {getStatusIcon(earning.status)}
                        
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-lg font-bold text-gray-800">
                              {formatCurrency(earning.netAmount)}
                            </Text>
                            <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
                              <Text className={`text-xs font-semibold ${statusStyle.text}`}>
                                {earning.status}
                              </Text>
                            </View>
                          </View>
                          
                          <Text className="text-gray-600 text-sm mb-1" numberOfLines={2}>
                            {description}
                          </Text>
                          
                          <Text className="text-gray-500 text-xs">
                            {formatDateTime(earning.earnedAt)}
                          </Text>
                        </View>
                      </View>
                    </PrimaryCard>
                  );
                })
              )}
            </>
          ) : (
            // Withdrawal History
            <>
              {withdrawalLoading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#f97316" />
                  <Text className="text-gray-600 mt-2">Loading withdrawals...</Text>
                </View>
              ) : filteredWithdrawals.length === 0 ? (
                <View className="items-center py-12">
                  <MaterialCommunityIcons name="bank-transfer" size={64} color="#9CA3AF" />
                  <Text className="text-xl font-semibold text-gray-600 mt-4">No withdrawals found</Text>
                  <Text className="text-gray-500 text-center mt-2">
                    {selectedWithdrawalsFilter === 'ALL' 
                      ? "You haven't made any withdrawal requests yet"
                      : `No ${selectedWithdrawalsFilter.toLowerCase()} withdrawals found`
                    }
                  </Text>
                  <PrimaryButton
                    title="Make Your First Withdrawal"
                    onPress={handleWithdrawFunds}
                    style={{ marginTop: 16 }}
                  />
                </View>
              ) : (
                filteredWithdrawals.map((withdrawal) => (
                  <WithdrawalHistoryCard
                    key={withdrawal.id}
                    withdrawal={withdrawal}
                    onRetry={handleRetryWithdrawal}
                  />
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Payment Preferences Modal */}
      <PaymentPreferencesModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        driverId={driverId}
        onBankDetailsUpdated={() => {
          setHasBankDetails(true);
          setShowPaymentModal(false);
        }}
      />

      <DriverBottomNavigation />
    </SafeAreaView>
  );
};

export default MyEarnings;
