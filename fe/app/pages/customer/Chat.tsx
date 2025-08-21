import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CustomerFooter from '../../../components/navigation/CustomerFooter';
import { Config } from '@/constants/Config';
import { supabase } from '@/lib/supabase';

// Interface for message data
interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId?: string;
  senderName: string;
  isRead: boolean;
  createdAt: string;
}

const Chat = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const conversationId = params.conversationId as string;
  const driverName = params.driverName as string;
  const driverPhoto = params.driverPhoto as string;
  const driverId = params.driverId as string;

  useEffect(() => {
    loadMessages();
    getCurrentUser();
  }, [conversationId]);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError('Please log in to send messages.');
        return;
      }
      setCustomerId(user.id);
    } catch (err) {
      console.error('Error getting current user:', err);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${Config.API_BASE}/chat/conversation/${conversationId}/messages`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to load messages (${response.status})`);
      }

      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
      } else {
        throw new Error(data.message || 'Failed to load messages');
      }

    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError(err?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !customerId) return;

    try {
      setSending(true);

      const response = await fetch(`${Config.API_BASE}/chat/conversation/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: customerId,
          receiverId: driverId,
          messageText: message.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to send message (${response.status})`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Reload messages to get the updated list
        await loadMessages();
        setMessage('');
      } else {
        throw new Error(data.message || 'Failed to send message');
      }

    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (senderId: string) => {
    return senderId === customerId;
  };

  const getDriverInitials = (driverName: string) => {
    if (!driverName) return 'D';
    return driverName.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0D47A1" />
          <Text className="mt-2 text-gray-600">Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-row items-center flex-1 ml-3">
          <View className="w-10 h-10 rounded-full mr-3 bg-orange-100 items-center justify-center">
            {driverPhoto ? (
              <Image
                source={{ uri: driverPhoto }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <Text className="text-orange-600 font-bold text-lg">
                {getDriverInitials(driverName)}
              </Text>
            )}
          </View>
          <Text className="text-lg font-bold">{driverName}</Text>
        </View>
        <TouchableOpacity className="p-2">
          <Ionicons name="call-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 ml-2">
          <Feather name="more-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Chat Messages Area */}
        <ScrollView className="flex-1 p-4">
          {error ? (
            <View className="items-center justify-center py-8">
              <Text className="text-red-500 text-center mb-4">{error}</Text>
              <TouchableOpacity 
                className="bg-[#0D47A1] px-4 py-2 rounded-lg"
                onPress={loadMessages}
              >
                <Text className="text-white font-semibold">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : messages.length === 0 ? (
            <View className="items-center justify-center py-8">
              <Ionicons name="chatbubble-ellipses-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4 text-lg font-medium">
                No messages yet
              </Text>
              <Text className="text-gray-400 text-center mt-2 text-sm">
                Start a conversation with your driver
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-center text-gray-500 text-sm mb-4">Today</Text>
              {messages.map((msg) => (
                <View key={msg.id} className={`flex-row items-end mb-3 ${isMyMessage(msg.senderId) ? 'justify-end' : 'justify-start'}`}>
                  {!isMyMessage(msg.senderId) && (
                    <View className="w-8 h-8 rounded-full mr-2 bg-orange-100 items-center justify-center">
                      {driverPhoto ? (
                        <Image
                          source={{ uri: driverPhoto }}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <Text className="text-orange-600 font-bold text-sm">
                          {getDriverInitials(driverName)}
                        </Text>
                      )}
                    </View>
                  )}
                  <View className={`max-w-[70%] p-3 rounded-lg ${isMyMessage(msg.senderId) ? 'bg-orange-500 self-end' : 'bg-gray-200 self-start'}`}>
                    <Text className={`${isMyMessage(msg.senderId) ? 'text-white' : 'text-gray-800'}`}>{msg.text}</Text>
                    <Text className={`text-xs mt-1 ${isMyMessage(msg.senderId) ? 'text-orange-200' : 'text-gray-500'} text-right`}>
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        {/* Message Input */}
        <View className="flex-row items-center p-4 border-t border-gray-200 bg-white">
          <TextInput
            className="flex-1 p-3 bg-gray-100 rounded-full text-base mr-3"
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!sending}
          />
          <TouchableOpacity className="p-2">
            <Feather name="smile" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSendMessage} 
            disabled={sending || !message.trim()}
            className={`ml-2 p-2 rounded-full ${sending || !message.trim() ? 'bg-gray-300' : 'bg-orange-500'}`}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
