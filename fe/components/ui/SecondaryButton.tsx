import React, { FC } from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';

/**
 * Interface for the SecondaryButton component's props.
 */
interface SecondaryButtonProps {
  /** The text to display on the button (e.g., "Back"). */
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
 * A secondary, reusable button component with an outline style.
 */
const SecondaryButton: FC<SecondaryButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      // Base styles for the outline button, with a conditional disabled state.
      // Note: 'border-blue-600' is used as a representative blue. Adjust this in your tailwind.config.js if needed.
      className={`bg-white border-2 border-blue-600 py-3 rounded-3xl items-center justify-center ${disabled ? 'opacity-50' : ''}`}
      style={style}
    >
      <Text
        className="text-blue-600 text-lg font-bold"
        style={textStyle}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default SecondaryButton;