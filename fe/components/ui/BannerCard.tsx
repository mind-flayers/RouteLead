import React, { FC } from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Changed to MaterialCommunityIcons for trophy icon

/**
 * Interface for the BannerCard component's props.
 */
interface BannerCardProps {
  /** The content to display inside the card. */
  children: React.ReactNode;
  /** Optional custom styles to be applied to the card container. */
  style?: StyleProp<ViewStyle>;
  /** Optional className for TailwindCSS. */
  className?: string;
}

/**
 * A reusable banner card component for displaying key information, like earnings,
 * featuring a prominent color and a subtle background icon.
 */
const BannerCard: FC<BannerCardProps> = ({ children, style, className }) => {
  return (
    <View
      className={`bg-orange-600 rounded-2xl p-4 overflow-hidden ${className || ''}`}
      style={style}
    >
      {/* Background Trophy Icon */}
      <View className="absolute right-5 top-0 bottom-0 justify-center">
        <MaterialCommunityIcons name="trophy" size={60} color="rgba(255,255,255,0.3)" />
      </View>

      {/* Content */}
      {children}
    </View>
  );
};

export default BannerCard;
