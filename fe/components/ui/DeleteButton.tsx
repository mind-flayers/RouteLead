import React, { FC } from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';

/**
 * Interface for the DeleteButton component's props.
 */
interface DeleteButtonProps {
  /** The text to display on the button (e.g., "Delete"). */
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
 * A reusable button component styled for destructive actions like "Delete".
 */
const DeleteButton: FC<DeleteButtonProps> = ({
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
      // Base styles for the delete button. The red color visually indicates a destructive action.
      // Using 'bg-red-500' for a strong, clear "danger" color.
      className={`bg-red-500 py-4 px-8 rounded-3xl items-center justify-center ${disabled ? 'opacity-50' : ''}`}
      style={style}
    >
      <Text
        className="text-white text-lg font-bold"
        style={textStyle}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default DeleteButton;