import React, { FC } from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle, View } from 'react-native';

/**
 * Interface for the PrimaryButton component's props.
 */
interface PrimaryButtonProps {
  /** The text to display on the button (e.g., "Next"). */
  title: string;
  /** The function to execute when the button is pressed. */
  onPress: () => void;
  /** Optional custom styles to be applied to the button container. */
  style?: StyleProp<ViewStyle>;
  /** Optional custom styles for the button text. */
  textStyle?: StyleProp<TextStyle>;
  /** If true, the button will be un-pressable and visually disabled. Defaults to false. */
  disabled?: boolean;
  /** Optional icon to display next to the title. */
  icon?: React.ReactNode;
  /** Optional className for TailwindCSS. */
  className?: string;
}

/**
 * A primary, reusable button component styled to match the application's main call-to-action button.
 */
const PrimaryButton: FC<PrimaryButtonProps> = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  disabled = false,
  icon,
  className
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      // Combining base styles with a conditional style for the disabled state.
      className={`bg-orange-500 py-4 px-8 rounded-3xl items-center justify-center flex-row ${disabled ? 'opacity-50' : ''} ${className || ''}`}
      style={style}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <Text className="text-white text-lg font-bold" style={textStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
