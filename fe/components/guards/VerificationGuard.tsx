import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVerificationGuard } from '@/hooks/useVerificationGuard';
import { useAuth } from '@/lib/auth';
import { VerificationStatus } from '@/lib/types';
import PrimaryButton from '@/components/ui/PrimaryButton';
import PrimaryCard from '@/components/ui/PrimaryCard';

interface VerificationGuardProps {
  children: React.ReactNode;
  featureName: string;
  description?: string;
}

export function VerificationGuard({ children, featureName, description }: VerificationGuardProps) {
  const { canAccessRestrictedFeatures, verificationStatus, verificationMessage, isDriver } = useVerificationGuard();
  const { refreshUserProfile } = useAuth();

  // Allow access if user is not a driver or if driver is verified
  if (!isDriver || canAccessRestrictedFeatures) {
    return <>{children}</>;
  }

  // Show verification requirement screen
  const getStatusIcon = () => {
    switch (verificationStatus) {
      case VerificationStatus.PENDING:
        return <Ionicons name="time-outline" size={48} color="#F59E0B" />;
      case VerificationStatus.REJECTED:
        return <Ionicons name="close-circle-outline" size={48} color="#EF4444" />;
      default:
        return <MaterialCommunityIcons name="shield-check-outline" size={48} color="#6B7280" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case VerificationStatus.PENDING:
        return 'text-amber-600';
      case VerificationStatus.REJECTED:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getActionButton = () => {
    switch (verificationStatus) {
      case VerificationStatus.PENDING:
        return (
          <PrimaryButton
            title="Check Verification Status"
            onPress={() => router.push('/pages/driver/Profile')}
            style={{ marginTop: 24 }}
          />
        );
      case VerificationStatus.REJECTED:
        return (
          <PrimaryButton
            title="Resubmit Verification"
            onPress={() => router.push('/pages/driver/Profile')}
            style={{ marginTop: 24 }}
          />
        );
      default:
        return (
          <PrimaryButton
            title="Start Verification"
            onPress={() => router.push('/pages/driver/Profile')}
            style={{ marginTop: 24 }}
          />
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        <PrimaryCard style={{ marginTop: 20 }}>
          <View className="items-center py-8">
            {getStatusIcon()}
            
            <Text className="text-2xl font-bold text-gray-900 mt-6 text-center">
              Verification Required
            </Text>
            
            <Text className="text-lg font-semibold text-gray-800 mt-2 text-center">
              {featureName}
            </Text>
            
            {description && (
              <Text className="text-gray-600 mt-2 text-center">
                {description}
              </Text>
            )}
            
            <View className="mt-6 p-4 bg-gray-100 rounded-lg">
              <Text className={`text-sm ${getStatusColor()} text-center`}>
                {verificationMessage}
              </Text>
            </View>

            {getActionButton()}

            {/* Debug refresh button */}
            <TouchableOpacity
              onPress={async () => {
                console.log('🔄 Manual refresh triggered');
                await refreshUserProfile();
              }}
              className="mt-4 p-2 bg-gray-200 rounded-lg"
            >
              <Text className="text-center text-gray-700 text-sm">
                🔄 Refresh Status
              </Text>
            </TouchableOpacity>
          </View>
        </PrimaryCard>

        {/* Additional Information */}
        <PrimaryCard style={{ marginTop: 16 }}>
          <View className="p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Why verification is required?
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row items-start">
                <Ionicons name="shield-checkmark" size={20} color="#10B981" style={{ marginTop: 2 }} />
                <Text className="text-gray-600 ml-3 flex-1">
                  Ensures safety and security for all users
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="car" size={20} color="#10B981" style={{ marginTop: 2 }} />
                <Text className="text-gray-600 ml-3 flex-1">
                  Verifies your driving credentials and vehicle details
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Ionicons name="people" size={20} color="#10B981" style={{ marginTop: 2 }} />
                <Text className="text-gray-600 ml-3 flex-1">
                  Builds trust with customers and improves booking rates
                </Text>
              </View>
            </View>
          </View>
        </PrimaryCard>

        {/* Quick access to profile */}
        <TouchableOpacity
          onPress={() => router.push('/pages/driver/Profile')}
          className="mt-4 p-4 bg-white rounded-lg border border-gray-200"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="person-circle-outline" size={24} color="#6B7280" />
              <Text className="text-gray-800 ml-3 font-medium">
                Go to Profile
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
