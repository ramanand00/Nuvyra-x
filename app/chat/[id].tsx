// app/chat/[id].tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/constants";

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chat, setChat] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { actualTheme, colors } = useTheme();

  useEffect(() => {
    loadUserData();
    fetchChat();
  }, [id]);

  const loadUserData = async () => {
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const fetchChat = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/chats/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setChat(data.chat);
        setMessages(data.chat.messages || []);
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load chat");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/chats/${id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages([...messages, data.message]);
        setNewMessage("");
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (!chat || !user) return null;
    return chat.participants.find((p: any) => p._id !== user.id);
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender._id === user?.id;
    const avatar = item.sender.avatar;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {!isMyMessage && (
          avatar ? (
            <Image
              source={{ uri: avatar }}
              style={[styles.messageAvatar, { backgroundColor: colors.card }]}
            />
          ) : (
            <View style={[styles.messageAvatar, { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }]}> 
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                {getInitials(item.sender.name)}
              </Text>
            </View>
          )
        )}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? 
              { backgroundColor: colors.primary, marginLeft: 'auto' } : 
              { backgroundColor: colors.card }
          ]}
        >
          {!isMyMessage && (
            <Text style={[styles.senderName, { color: colors.secondary }]}>
              {item.sender.name}
            </Text>
          )}
          <Text style={[
            styles.messageText, 
            { color: isMyMessage ? '#fff' : colors.text }
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime, 
            { color: isMyMessage ? 'rgba(255,255,255,0.7)' : colors.secondary }
          ]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  const otherParticipant = getOtherParticipant();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={actualTheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        {otherParticipant && (
          <View style={styles.headerContent}>
            {otherParticipant.avatar ? (
              <Image
                source={{ uri: otherParticipant.avatar }}
                style={[styles.headerAvatar, { backgroundColor: colors.card }]}
              />
            ) : (
              <View style={[styles.headerAvatar, { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }]}> 
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                  {getInitials(otherParticipant.name)}
                </Text>
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={[styles.headerName, { color: colors.text }]}>
                {otherParticipant.name}
              </Text>
              <Text style={[styles.headerStatus, { color: colors.success }]}>
                Online
              </Text>
            </View>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.menuButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesContainer}
        inverted
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      {/* Input Container - Fixed at bottom */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={[styles.inputWrapper, { backgroundColor: colors.card }]}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: colors.background,
                borderColor: colors.border, 
                color: colors.text 
              }
            ]}
            placeholder="Type a message..."
            placeholderTextColor={colors.secondary + '80'}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            textAlignVertical="center"
            enablesReturnKeyAutomatically
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              { 
                backgroundColor: newMessage.trim() ? colors.primary : colors.secondary + '40',
                opacity: newMessage.trim() ? 1 : 0.6
              }
            ]} 
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <Ionicons name="time-outline" size={20} color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: { 
    flex: 1,
  },
  headerName: { 
    fontSize: 16, 
    fontWeight: "bold",
    marginBottom: 2,
  },
  headerStatus: { 
    fontSize: 12,
  },
  menuButton: {
    padding: 4,
  },
  messagesContainer: { 
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  myMessage: { 
    justifyContent: "flex-end",
  },
  theirMessage: { 
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 18,
    marginHorizontal: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 2,
    opacity: 0.7,
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 25 : 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});