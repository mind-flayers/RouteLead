import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { ActionButton } from '@/components/ui/ActionButton';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface RouteCardProps {
  routeId: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  bids?: number;
  highestBid?: string;
  status?: 'Active' | 'Expired';
  onViewBids?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function RouteCard({
  routeId,
  origin,
  destination,
  date,
  time,
  bids,
  highestBid,
  status,
  onViewBids,
  onEdit,
  onDelete,
}: RouteCardProps) {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const activeColor = useThemeColor({}, 'success');
  const expiredColor = useThemeColor({}, 'error');

  const styles = StyleSheet.create({
    container: {
      marginBottom: 15,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    routeId: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 5,
      backgroundColor: status === 'Active' ? activeColor : expiredColor,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    infoText: {
      marginLeft: 8,
      fontSize: 14,
      color: textColor,
    },
    bidInfo: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: useThemeColor({}, 'border'),
    },
    bidText: {
      fontSize: 14,
      color: textColor,
    },
    highestBidText: {
      fontWeight: 'bold',
      color: useThemeColor({}, 'primary'),
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 15,
    },
    buttonSpacer: {
      width: 10,
    },
  });

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.routeId}>{routeId}</ThemedText>
        {status && (
          <View style={styles.statusBadge}>
            <ThemedText style={styles.statusText}>{status}</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.infoRow}>
        <IconSymbol name="location" size={18} color={iconColor} />
        <ThemedText style={styles.infoText}>{origin}</ThemedText>
      </View>
      <View style={styles.infoRow}>
        <IconSymbol name="arrow.down" size={18} color={iconColor} />
        <ThemedText style={styles.infoText}>{destination}</ThemedText>
      </View>
      <View style={styles.infoRow}>
        <IconSymbol name="calendar" size={18} color={iconColor} />
        <ThemedText style={styles.infoText}>{date}</ThemedText>
      </View>
      <View style={styles.infoRow}>
        <IconSymbol name="timer" size={18} color={iconColor} />
        <ThemedText style={styles.infoText}>{time}</ThemedText>
      </View>

      {(bids !== undefined || highestBid !== undefined) && (
        <View style={styles.bidInfo}>
          {bids !== undefined && (
            <ThemedText style={styles.bidText}>Bids: {bids}</ThemedText>
          )}
          {highestBid !== undefined && (
            <ThemedText style={styles.bidText}>
              Highest Bid: <ThemedText style={styles.highestBidText}>{highestBid}</ThemedText>
            </ThemedText>
          )}
        </View>
      )}

      <View style={styles.actions}>
        {onViewBids && <ActionButton title="View Bids" onPress={onViewBids} type="primary" />}
        {onEdit && (
          <>
            <View style={styles.buttonSpacer} />
            <ActionButton title="Edit" onPress={onEdit} type="secondary" />
          </>
        )}
        {onDelete && (
          <>
            <View style={styles.buttonSpacer} />
            <ActionButton title="Delete" onPress={onDelete} type="error" />
          </>
        )}
      </View>
    </Card>
  );
}