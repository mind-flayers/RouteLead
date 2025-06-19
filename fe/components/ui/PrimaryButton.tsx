import React, { FC } from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';

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
}

/**
 * A primary, reusable button component styled to match the application's main call-to-action button.
 */
const PrimaryButton: FC<PrimaryButtonProps> = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      // Combining base styles with a conditional style for the disabled state.
      className={`bg-orange-400 py-4 px-8 rounded-3xl items-center justify-center ${disabled ? 'opacity-50' : ''}`}
      style={style}
    >
      <Text className="text-white text-lg font-bold" style={textStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;