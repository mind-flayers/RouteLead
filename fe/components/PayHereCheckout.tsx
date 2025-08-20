import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';

interface PayHereCheckoutProps {
  paymentData: any;
  payHereUrl: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

export default function PayHereCheckout({ 
  paymentData, 
  payHereUrl, 
  onSuccess, 
  onCancel, 
  onError 
}: PayHereCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Create the HTML form that will auto-submit to PayHere
  const createPayHereForm = () => {
    const formFields = Object.entries(paymentData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
      .join('');

    // Log the form data for debugging
    console.log('🔗 PayHere form data:', JSON.stringify(paymentData, null, 2));
    console.log('🔗 PayHere URL:', payHereUrl);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting to PayHere...</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .debug-info {
            margin-top: 20px;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 5px;
            font-size: 12px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h3>Redirecting to PayHere...</h3>
          <p>Please wait while we securely redirect you to the payment gateway.</p>
          
          <div class="debug-info">
            <strong>Debug Info:</strong><br>
            URL: ${payHereUrl}<br>
            Parameters: ${Object.keys(paymentData).length} fields<br>
            <button onclick="submitForm()" style="margin-top: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Submit Form</button>
          </div>
        </div>
        
        <form id="payhereForm" method="POST" action="${payHereUrl}" style="display: none;">
          ${formFields}
        </form>
        
        <script>
          function submitForm() {
            console.log('Submitting form to:', '${payHereUrl}');
            console.log('Form data:', ${JSON.stringify(paymentData)});
            document.getElementById('payhereForm').submit();
          }
          
          // Auto-submit the form after a short delay
          setTimeout(function() {
            console.log('Auto-submitting form...');
            submitForm();
          }, 1000);
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    const data = event.nativeEvent.data;
    console.log('📱 WebView message received:', data);
    
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'payment_success') {
        setLoading(false);
        Alert.alert(
          'Payment Successful',
          'Your payment has been processed successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess?.(message.data);
                router.back();
              }
            }
          ]
        );
      } else if (message.type === 'payment_cancelled') {
        setLoading(false);
        Alert.alert(
          'Payment Cancelled',
          'Your payment was cancelled.',
          [
            {
              text: 'OK',
              onPress: () => {
                onCancel?.();
                router.back();
              }
            }
          ]
        );
      } else if (message.type === 'payment_error') {
        setLoading(false);
        setError(message.error);
        onError?.(message.error);
      }
    } catch (e) {
      console.log('📱 Non-JSON message from WebView:', data);
    }
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('❌ WebView error:', nativeEvent);
    setError(nativeEvent.description || 'Failed to load payment page');
    setLoading(false);
  };

  const handleWebViewLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleWebViewLoadEnd = () => {
    setLoading(false);
  };

  const injectedJavaScript = `
    // Listen for PayHere redirects and communicate back to React Native
    (function() {
      // Check if we're on a return/cancel URL
      const currentUrl = window.location.href;
      
      if (currentUrl.includes('return') || currentUrl.includes('success')) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'payment_success',
          data: {
            url: currentUrl,
            timestamp: new Date().toISOString()
          }
        }));
      } else if (currentUrl.includes('cancel') || currentUrl.includes('failed')) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'payment_cancelled',
          data: {
            url: currentUrl,
            timestamp: new Date().toISOString()
          }
        }));
      }
      
      // Listen for form submission
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          console.log('Form submitted to:', form.action);
        });
      });
      
      // Listen for navigation
      window.addEventListener('beforeunload', function() {
        console.log('Page is about to unload');
      });
      
      true; // Required for injected JavaScript
    })();
  `;

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFA726" />
          <Text style={styles.loadingText}>Loading PayHere...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}
      
      <WebView
        source={{ html: createPayHereForm() }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        onError={handleWebViewError}
        onLoadStart={handleWebViewLoadStart}
        onLoadEnd={handleWebViewLoadEnd}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        userAgent="RouteLead-Mobile-App"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    borderBottomWidth: 1,
    borderBottomColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
});
