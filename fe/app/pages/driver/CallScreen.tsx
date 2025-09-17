import React, { useEffect, useRef, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileImage } from '@/components/ui/ProfileImage';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const CallScreen = () => {
  const router = useRouter();
  const { phoneNumber, customerName } = useLocalSearchParams();
  
  // Ensure customerName is a string, not an array
  const displayName = Array.isArray(customerName) ? customerName[0] : customerName;

  const gradientColors = useRef(new Animated.Value(0)).current;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Start gradient animation
    Animated.loop(
      Animated.timing(gradientColors, {
        toValue: 1,
        duration: 10000, // 10 seconds for a full cycle
        easing: Easing.linear,
        useNativeDriver: false, // Cannot use native driver for color animation
      })
    ).start();

    // Start call duration timer
    intervalRef.current = setInterval(() => {
      setCallDuration((prevDuration) => prevDuration + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const animatedColor1 = gradientColors.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#FF8C00', '#FFA500', '#FF8C00'], // Orange to DarkOrange and back
  });

  const animatedColor2 = gradientColors.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#FFA500', '#FF8C00', '#FFA500'], // DarkOrange to Orange and back
  });

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleEndCall = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    router.back(); // Go back to the previous screen (DeliveryManagement)
  };

  return (
    <SafeAreaView className="flex-1">
      <Animated.View style={{ flex: 1 }}>
        <AnimatedLinearGradient
          colors={[animatedColor1, animatedColor2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          {/* Top Bar */}
          <View className="flex-row items-center justify-between px-4 py-3">
            <TouchableOpacity onPress={() => router.back()} className="items-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="w-6" />
          </View>

          <View className="flex-1 justify-start items-center">
            <View className="bg-purple-200 p-1 rounded-full mb-8">
              <ProfileImage 
                useCurrentUser={false}
                size={128}
                borderRadius={64}
              />
            </View>
            <Text className="text-3xl font-bold text-white mb-2">{displayName || 'Customer'}</Text>
          </View>

          {/* Call Timer */}
          {/* <View className="absolute bottom-36 w-full flex-row justify-center items-center">
            <View className="flex-row items-center bg-black bg-opacity-30 px-4 py-2 rounded-full">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
              <Text className="text-white text-lg">{formatTime(callDuration)}</Text>
            </View>
          </View> */}

          {/* Action Buttons */}
          <View className="absolute bottom-10 mb-20 w-full flex-row justify-center items-center">
            <TouchableOpacity
              className="bg-white bg-opacity-30 p-4 rounded-full mx-3"
              onPress={() => setIsSpeakerOn(!isSpeakerOn)}
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.30,
                shadowRadius: 4.65,
                elevation: 8,
              }}
            >
              <Ionicons name={isSpeakerOn ? "volume-high" : "volume-mute"} size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white bg-opacity-30 p-4 rounded-full mx-3"
              onPress={() => setIsMuted(!isMuted)}
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.30,
                shadowRadius: 4.65,
                elevation: 8,
              }}
            >
              <MaterialCommunityIcons name={isMuted ? "microphone-off" : "microphone"} size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 p-4 rounded-full mx-3 shadow-lg"
              onPress={handleEndCall}
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.30,
                shadowRadius: 4.65,
                elevation: 8,
              }}
            >
              <Ionicons name="call" size={30} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
          </View>
        </AnimatedLinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
};

export default CallScreen;
