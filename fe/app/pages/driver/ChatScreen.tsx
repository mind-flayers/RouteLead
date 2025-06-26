import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const ChatScreen = () => {
  const router = useRouter();
  const { name, profileImage } = useLocalSearchParams();
  const [message, setMessage] = useState('');

  // Dummy messages for demonstration
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi there!', time: '08:42 PM', sender: 'other' },
    { id: '2', text: 'Hello!', time: '08:43 PM', sender: 'me' },
    { id: '3', text: 'How are you?', time: '08:44 PM', sender: 'other' },
    { id: '4', text: 'I\'m good, thanks! How about you?', time: '08:45 PM', sender: 'me' },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: String(messages.length + 1), // Simple ID generation
        text: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'me',
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
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
            source={profileImage ? { uri: profileImage as string } : require('../../../assets/images/profile_placeholder.jpeg')}
            className="w-10 h-10 rounded-full mr-3"
          />
          <Text className="text-lg font-bold">{name || 'Chat'}</Text>
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
          <Text className="text-center text-gray-500 text-sm mb-4">Today</Text>
          {messages.map((msg) => (
            <View key={msg.id} className={`flex-row items-end mb-3 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'other' && (
                <Image
                  source={profileImage ? { uri: profileImage as string } : require('../../../assets/images/profile_placeholder.jpeg')}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <View className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'me' ? 'bg-indigo-700 self-end' : 'bg-gray-200 self-start'}`}>
                <Text className={`${msg.sender === 'me' ? 'text-white' : 'text-gray-800'}`}>{msg.text}</Text>
                <Text className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-indigo-200' : 'text-gray-500'} text-right`}>{msg.time}</Text>
              </View>
            </View>
          ))}
          <Text className="text-right text-gray-500 text-xs mt-1">Sent</Text>
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
          />
          <TouchableOpacity className="p-2">
            <Feather name="smile" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSendMessage} className="ml-2 p-2 bg-orange-500 rounded-full">
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
