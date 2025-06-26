import { StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page when component mounts
    router.replace('/pages/login');
  }, [router]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText>Redirecting to login...</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 