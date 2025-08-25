import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ApiService, ChatMessage } from '@/services/apiService';
import { useDriverInfo } from '@/hooks/useEarningsData';

const ChatScreen = () => {
  const router = useRouter();
  const { conversationId, customerName, customerId, bidId, profileImage, isNewConversation } = useLocalSearchParams();
  const { driverId } = useDriverInfo();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (driverId) {
      initializeChat();
    }
  }, [driverId]);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      if (!driverId) {
        Alert.alert('Error', 'Driver ID not found. Please log in again.');
        router.back();
        return;
      }

      let chatId = conversationId as string;

      // If this is a new conversation, create it first
      if (isNewConversation === 'true' && bidId && customerId) {
        console.log('Creating new conversation for bid:', bidId);
        const createResponse = await ApiService.createConversation(
          bidId as string,
          customerId as string,
          driverId
        );
        
        if (createResponse.success) {
          chatId = createResponse.conversationId;
          setCurrentConversationId(chatId);
          console.log('Conversation created/found:', chatId);
        } else {
          Alert.alert('Error', 'Failed to create conversation');
          router.back();
          return;
        }
      } else if (conversationId) {
        setCurrentConversationId(conversationId as string);
        chatId = conversationId as string;
      }

      // Load existing messages
      if (chatId) {
        await loadMessages(chatId);
      }

    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to initialize chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const messagesData = await ApiService.getConversationMessages(chatId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversationId || !driverId || !customerId) {
      console.log('Missing required data for sending message');
      return;
    }

    const messageText = message.trim();
    setMessage(''); // Clear input immediately for better UX

    try {
      const response = await ApiService.sendMessage(
        currentConversationId,
        driverId,
        customerId as string,
        messageText
      );

      if (response.success) {
        // Reload messages to get the latest state
        await loadMessages(currentConversationId);
      } else {
        Alert.alert('Error', 'Failed to send message');
        setMessage(messageText); // Restore message on failure
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setMessage(messageText); // Restore message on failure
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(msg => {
      const dateKey = formatDate(msg.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    
    return groups;
  };

  const renderMessage = (msg: ChatMessage) => {
    const isMyMessage = msg.senderId === driverId;
    
    return (
      <View key={msg.id} className={`flex-row items-end mb-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
        {!isMyMessage && (
          <Image
            source={profileImage && profileImage !== 'profile_placeholder' ? 
              { uri: profileImage as string } : 
              require('../../../assets/images/profile_placeholder.jpeg')
            }
            className="w-8 h-8 rounded-full mr-2"
          />
        )}
        <View className={`max-w-[70%] p-3 rounded-lg ${
          isMyMessage ? 'bg-indigo-700 self-end' : 'bg-gray-200 self-start'
        }`}>
          <Text className={`${isMyMessage ? 'text-white' : 'text-gray-800'}`}>
            {msg.text}
          </Text>
          <Text className={`text-xs mt-1 ${
            isMyMessage ? 'text-indigo-200' : 'text-gray-500'
          } text-right`}>
            {formatTime(msg.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-row items-center flex-1 ml-3">
          <Image
            source={profileImage && profileImage !== 'profile_placeholder' ? 
              { uri: profileImage as string } : 
              require('../../../assets/images/profile_placeholder.jpeg')
            }
            className="w-10 h-10 rounded-full mr-3"
          />
          <Text className="text-lg font-bold">{customerName || 'Chat'}</Text>
        </View>
        <TouchableOpacity 
          className="p-2"
          onPress={() => router.push({
            pathname: '/pages/driver/CallScreen',
            params: { customerName: customerName }
          })}
        >
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
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {loading ? (
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-gray-500">Loading messages...</Text>
            </View>
          ) : (
            <>
              {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                <View key={date}>
                  <Text className="text-center text-gray-500 text-sm mb-4 mt-4">{date}</Text>
                  {dateMessages.map(renderMessage)}
                </View>
              ))}
              {messages.length === 0 && (
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-gray-500 text-center">
                    {isNewConversation === 'true' ? 
                      'Start your conversation with the customer!' : 
                      'No messages yet'
                    }
                  </Text>
                </View>
              )}
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
            editable={!loading && currentConversationId !== null}
          />
          <TouchableOpacity className="p-2">
            <Feather name="smile" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSendMessage} 
            className={`ml-2 p-2 rounded-full ${
              loading || !message.trim() || !currentConversationId ? 
                'bg-gray-300' : 'bg-orange-500'
            }`}
            disabled={loading || !message.trim() || !currentConversationId}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={loading || !message.trim() || !currentConversationId ? 'gray' : 'white'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
