import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class NavigationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('Navigation Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <View 
          className="flex-row justify-center items-center bg-white border-t border-gray-200 px-2 py-2 absolute bottom-0 w-full" 
          style={{ minHeight: 60 }}
        >
          <TouchableOpacity 
            className="flex-row items-center justify-center py-2 px-4 bg-red-100 rounded-lg"
            onPress={() => this.setState({ hasError: false })}
          >
            <Ionicons name="warning-outline" size={20} color="#DC2626" />
            <Text className="text-red-600 ml-2 text-sm">
              Navigation Error - Tap to retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default NavigationErrorBoundary;
