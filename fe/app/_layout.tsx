import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import '../global.css';
import { AuthProvider } from '../lib/auth';
import { RouteCreationProvider } from '../contexts/RouteCreationContext';
import { cacheService } from '../services/cacheService';

export {
  ErrorBoundary,
} from 'expo-router';

// Remove fixed initial route to allow dynamic routing based on auth state
// export const unstable_settings = {
//   initialRouteName: 'pages/login',
// };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Initialize cache service when app is ready
      cacheService.initialize().then(() => {
        console.log('Cache service initialized');
      }).catch((error) => {
        console.error('Failed to initialize cache service:', error);
      });
      
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Cleanup cache service when app unmounts
  useEffect(() => {
    return () => {
      cacheService.cleanup();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RouteCreationProvider>
        <RootLayoutNav />
      </RouteCreationProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="pages/login" options={{ headerShown: false }} />
        <Stack.Screen name="pages/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pages/driver/DeliveryManagement" options={{ headerShown: false }} />
        <Stack.Screen name="pages/driver/MyEarnings" options={{ headerShown: false }} />
        <Stack.Screen name="pages/driver/MyRoutes" options={{ headerShown: false }} />
        <Stack.Screen name="pages/driver/ChatList" options={{ headerShown: false }} />
        <Stack.Screen name="pages/driver/ChatScreen" options={{ headerShown: false }} />
        <Stack.Screen name="pages/driver/Notifications" options={{ headerShown: false }} />
        <Stack.Screen name="pages/driver/Profile" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
