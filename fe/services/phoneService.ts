import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';

export class PhoneService {
  /**
   * Format phone number for display and dialing
   * Accepts international and local Sri Lankan formats
   */
  static formatPhoneNumber(phoneNumber: string | null | undefined): string {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // If it's a Sri Lankan number starting with 94, format it
    if (digitsOnly.startsWith('94') && digitsOnly.length === 11) {
      const localNumber = digitsOnly.substring(2);
      return `+94 ${localNumber.substring(0, 2)} ${localNumber.substring(2, 5)} ${localNumber.substring(5)}`;
    }
    
    // If it's a local Sri Lankan number starting with 0, format it
    if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
      return `+94 ${digitsOnly.substring(1, 3)} ${digitsOnly.substring(3, 6)} ${digitsOnly.substring(6)}`;
    }
    
    // If it's a local Sri Lankan number without leading 0, format it
    if (digitsOnly.length === 9) {
      return `+94 ${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 5)} ${digitsOnly.substring(5)}`;
    }
    
    // Return original number if it doesn't match expected patterns
    return phoneNumber;
  }

  /**
   * Get dial-ready phone number (remove formatting)
   */
  static getDialNumber(phoneNumber: string | null | undefined): string {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters except +
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Convert Sri Lankan local format to international
    if (cleanNumber.startsWith('0') && cleanNumber.length === 10) {
      return '+94' + cleanNumber.substring(1);
    }
    
    // If it doesn't start with +, assume it's a local number and add +94
    if (!cleanNumber.startsWith('+') && cleanNumber.length === 9) {
      return '+94' + cleanNumber;
    }
    
    return cleanNumber;
  }

  /**
   * Validate if phone number is valid for dialing
   */
  static isValidPhoneNumber(phoneNumber: string | null | undefined): boolean {
    if (!phoneNumber) return false;
    
    const dialNumber = this.getDialNumber(phoneNumber);
    
    // Check if it's a valid Sri Lankan number
    const sriLankanPattern = /^\+94[0-9]{9}$/;
    
    // Check if it's any international number
    const internationalPattern = /^\+[1-9]\d{6,14}$/;
    
    return sriLankanPattern.test(dialNumber) || internationalPattern.test(dialNumber);
  }

  /**
   * Make a phone call using device's native dialer
   */
  static async makeCall(phoneNumber: string | null | undefined, contactName?: string): Promise<void> {
    try {
      if (!phoneNumber) {
        Alert.alert('Error', 'No phone number available for this contact.');
        return;
      }

      if (!this.isValidPhoneNumber(phoneNumber)) {
        Alert.alert('Error', 'Invalid phone number format.');
        return;
      }

      const dialNumber = this.getDialNumber(phoneNumber);
      const telUrl = `tel:${dialNumber}`;

      // Check if the device can make phone calls
      const canOpen = await Linking.canOpenURL(telUrl);
      
      if (!canOpen) {
        if (Platform.OS === 'web') {
          Alert.alert('Not Supported', 'Phone calls are not supported on web platform.');
        } else {
          Alert.alert('Not Supported', 'Your device does not support making phone calls.');
        }
        return;
      }

      // Show confirmation dialog before making call
      const displayNumber = this.formatPhoneNumber(phoneNumber);
      const title = contactName ? `Call ${contactName}?` : 'Make Call?';
      const message = `Do you want to call ${displayNumber}?`;

      Alert.alert(
        title,
        message,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Call',
            style: 'default',
            onPress: async () => {
              try {
                await Linking.openURL(telUrl);
              } catch (error) {
                console.error('Error opening phone dialer:', error);
                Alert.alert('Error', 'Failed to open phone dialer. Please try again.');
              }
            },
          },
        ]
      );

    } catch (error) {
      console.error('Error in makeCall:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  }

  /**
   * Quick dial without confirmation (for emergency or specific use cases)
   */
  static async quickDial(phoneNumber: string | null | undefined): Promise<void> {
    try {
      if (!phoneNumber || !this.isValidPhoneNumber(phoneNumber)) {
        return;
      }

      const dialNumber = this.getDialNumber(phoneNumber);
      const telUrl = `tel:${dialNumber}`;

      const canOpen = await Linking.canOpenURL(telUrl);
      if (canOpen) {
        await Linking.openURL(telUrl);
      }
    } catch (error) {
      console.error('Error in quickDial:', error);
    }
  }
}
