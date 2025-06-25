import React, { FC } from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';

/**
 * Interface for the LightButton component's props.
 */
interface LightButtonProps {
  /** The text to display on the button (e.g., "Edit"). */
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
 * A reusable light-themed button component with a subtle outline, ideal for tertiary actions.
 */
const EditButton: FC<LightButtonProps> = ({
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
      // Base styles for the light outline button.
      className={`bg-white border border-gray-200 py-4 px-8 rounded-3xl items-center justify-center ${disabled ? 'opacity-50' : ''}`}
      style={style}
    >
      <Text
        className="text-gray-800 text-base font-medium"
        style={textStyle}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default EditButton;