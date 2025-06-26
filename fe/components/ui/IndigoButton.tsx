import React, { FC } from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle, StyleSheet } from 'react-native';

/**
 * Interface for the IndigoButton component's props.
 */
interface IndigoButtonProps {
  /** The text to display on the button (e.g., "Active Routes"). */
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
 * A reusable solid button component with a distinct indigo/navy blue style.
 */
const IndigoButton: FC<IndigoButtonProps> = ({
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
      // Base styles for the button, including the specific corner radius and color.
      // Note: 'bg-indigo-600' is used to match the color. This can be customized in tailwind.config.js.
      className={`bg-blue-900 py-4 px-8 rounded-3xl items-center justify-center ${disabled ? 'opacity-50' : ''}`}
      style={style}
    >
      <Text
        style={[styles.buttonText, textStyle]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default IndigoButton;