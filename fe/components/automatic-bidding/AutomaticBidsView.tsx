import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BidSelectionDto } from '../../services/apiService';
import PrimaryCard from '../ui/PrimaryCard';
import { ProfileAvatar } from '../ui/ProfileImage';

interface AutomaticBidsViewProps {
  rankedBids: BidSelectionDto[];
  acceptedBids: BidSelectionDto[];
  biddingActive: boolean;
  biddingEnded: boolean;
  onRefresh?: () => void;
}

export const AutomaticBidsView: React.FC<AutomaticBidsViewProps> = ({
  rankedBids,
  acceptedBids,
  biddingActive,
  biddingEnded,
  onRefresh
}) => {
  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1);
  };

  const getBidStatusColor = (status: string) => {
    if (status === 'ACCEPTED') {
      return { bg: '#E8F5E8', text: '#4CAF50', border: '#4CAF50' };
    }
    if (status === 'REJECTED') {
      return { bg: '#FFEBEE', text: '#F44336', border: '#F44336' };
    }
    // PENDING or default
    return { bg: '#FFF3E0', text: '#FF9800', border: '#FF9800' };
  };

  const renderBidCard = (bid: BidSelectionDto, rank?: number) => {
    const customerName = `${bid.customerFirstName || ''} ${bid.customerLastName || ''}`.trim() || 'Unknown Customer';
    const statusColor = getBidStatusColor(bid.status);
    
    // Display status text
    const getStatusText = (status: string) => {
      switch (status) {
        case 'ACCEPTED': return 'WON';
        case 'REJECTED': return 'REJECTED';
        case 'PENDING': return 'PENDING';
        default: return status;
      }
    };
    
    return (
      <PrimaryCard 
        key={bid.id} 
        style={{ 
          marginBottom: 12,
          borderWidth: bid.status === 'ACCEPTED' ? 2 : 1,
          borderColor: bid.status === 'ACCEPTED' ? statusColor.border : '#E0E0E0'
        }}
      >
        {/* Winner Badge */}
        {bid.status === 'ACCEPTED' && (
          <View className="absolute -top-2 -right-2 bg-green-500 rounded-full px-3 py-1 z-10">
            <Text className="text-white text-xs font-bold">WINNER</Text>
          </View>
        )}

        {/* Rank Badge */}
        {rank && bid.status !== 'ACCEPTED' && (
          <View className="absolute -top-2 -left-2 bg-blue-500 rounded-full w-8 h-8 items-center justify-center z-10">
            <Text className="text-white text-xs font-bold">#{rank}</Text>
          </View>
        )}

        {/* Customer Info */}
        <View className="flex-row items-center mb-3">
          <ProfileAvatar 
            userId={bid.requestId} // Using requestId as fallback
            size={48}
          />
          <View className="ml-3 flex-1">
            <Text className="text-lg font-bold text-gray-900">{customerName}</Text>
            <Text className="text-gray-500 text-sm">Score: {formatScore(bid.score)}%</Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-green-600">
              {formatPrice(bid.offeredPrice)}
            </Text>
            <View 
              className="px-2 py-1 rounded-full mt-1"
              style={{ backgroundColor: statusColor.bg }}
            >
              <Text 
                className="text-xs font-semibold"
                style={{ color: statusColor.text }}
              >
                {getStatusText(bid.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Parcel Details */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-gray-700 mb-1">
            {bid.weightKg}kg • {bid.volume}m³
          </Text>
          {bid.description && (
            <Text className="text-sm text-gray-600 mb-2">{bid.description}</Text>
          )}
        </View>

        {/* Score Breakdown */}
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="text-sm font-medium text-gray-700 mb-2">Bid Analysis</Text>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xs text-gray-600">Price Score</Text>
            <Text className="text-xs font-medium">{(bid.normalizedPrice * 100).toFixed(1)}%</Text>
          </View>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xs text-gray-600">Volume Score</Text>
            <Text className="text-xs font-medium">{(bid.normalizedVolume * 100).toFixed(1)}%</Text>
          </View>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xs text-gray-600">Distance Score</Text>
            <Text className="text-xs font-medium">{(bid.normalizedDistance * 100).toFixed(1)}%</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-gray-600">Detour Impact</Text>
            <Text className="text-xs font-medium">{(bid.detourPercentage * 100).toFixed(1)}%</Text>
          </View>
        </View>

        {/* Pickup & Delivery Locations */}
        {(bid.pickupLocation || bid.deliveryLocation) && (
          <View className="border-t border-gray-100 pt-3">
            {bid.pickupLocation && (
              <View className="flex-row items-start mb-2">
                <Ionicons name="location" size={16} color="#10b981" style={{ marginTop: 2 }} />
                <View className="ml-2 flex-1">
                  <Text className="text-sm font-medium text-gray-700">Pickup</Text>
                  <Text className="text-sm text-gray-600">{bid.pickupLocation}</Text>
                </View>
              </View>
            )}
            
            {bid.deliveryLocation && (
              <View className="flex-row items-start">
                <Ionicons name="location" size={16} color="#ef4444" style={{ marginTop: 2 }} />
                <View className="ml-2 flex-1">
                  <Text className="text-sm font-medium text-gray-700">Delivery</Text>
                  <Text className="text-sm text-gray-600">{bid.deliveryLocation}</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </PrimaryCard>
    );
  };

  return (
    <ScrollView 
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Winners Section */}
      {acceptedBids.length > 0 && (
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-3 px-2">
            🏆 Winning Bids ({acceptedBids.length})
          </Text>
          {acceptedBids.map((bid) => renderBidCard(bid))}
        </View>
      )}

      {/* All Bids Ranking */}
      <View>
        <Text className="text-xl font-bold text-gray-900 mb-3 px-2">
          📊 All Bids Ranked ({rankedBids.length})
        </Text>
        
        {/* Bidding Status Explanation */}
        {rankedBids.length > 0 && (
          <PrimaryCard style={{ marginBottom: 16 }}>
            <View className="bg-blue-50 p-3 rounded-lg">
              <Text className="text-sm text-blue-700 font-medium mb-1">
                📋 Bidding Status Guide
              </Text>
              <Text className="text-xs text-blue-600">
                • <Text className="font-semibold text-orange-600">PENDING</Text>: Bids awaiting selection{'\n'}
                • <Text className="font-semibold text-green-600">WON</Text>: Accepted winning bids{'\n'}
                • <Text className="font-semibold text-red-600">REJECTED</Text>: Declined bids
              </Text>
              <Text className="text-xs text-blue-500 mt-2 italic">
                When bidding ends, the highest-scored bid is automatically accepted.
              </Text>
            </View>
          </PrimaryCard>
        )}
        
        {rankedBids.length === 0 ? (
          <PrimaryCard>
            <View className="items-center py-8">
              <MaterialIcons name="inbox" size={48} color="#CCC" />
              <Text className="text-lg font-semibold text-gray-600 mt-2">No Bids Available</Text>
              <Text className="text-sm text-gray-500 mt-1">No bids have been placed yet.</Text>
            </View>
          </PrimaryCard>
        ) : (
          rankedBids.map((bid, index) => 
            renderBidCard(bid, index + 1)
          )
        )}
      </View>
    </ScrollView>
  );
};