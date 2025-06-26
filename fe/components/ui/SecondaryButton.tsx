import React, { FC } from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle, View } from 'react-native';

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
  /** Optional icon to display next to the title. */
  icon?: React.ReactNode;
  /** Optional className for TailwindCSS. */
  className?: string;
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
  icon,
  className,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      // Base styles for the outline button, with a conditional disabled state.
      // Note: 'border-blue-600' is used as a representative blue. Adjust this in your tailwind.config.js if needed.
      className={`bg-white border-2 border-blue-800 py-4 px-8 rounded-3xl items-center justify-center flex-row ${disabled ? 'opacity-50' : ''} ${className || ''}`}
      style={style}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <Text
        className="text-blue-800 text-lg font-bold"
        style={textStyle}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default SecondaryButton;
