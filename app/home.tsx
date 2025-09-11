// app/home.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "./config/constants";
import { useTheme } from "./contexts/ThemeContext";

interface Chat {
  _id: string;
  participants: any[];
  lastMessage: {
    content: string;
    timestamp: string;
    sender: {
      _id: string;
      name: string;
      avatar?: string;
    };
  };
  updatedAt: string;
}

export default function Home() {
  const router = useRouter();
  const { colors, actualTheme } = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    fetchChats();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchChats = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        Alert.alert("Error", "Please login again");
        router.replace("/login");
        return;
      }

      console.log("Fetching chats from:", `${API_BASE_URL}/chats`);
      
      const response = await fetch(`${API_BASE_URL}/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response) {
        throw new Error("No response from server");
      }

      const data = await response.json();

      if (response.ok) {
        console.log("Chats fetched successfully:", data.chats.length);
        setChats(data.chats);
      } else {
        if (response.status === 401) {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userData");
          Alert.alert("Session Expired", "Please login again");
          router.replace("/login");
        } else {
          Alert.alert("Error", data.message || "Failed to fetch chats");
        }
      }
    } catch (error) {
      console.error("Fetch chats error:", error);
      Alert.alert("Error", "Failed to fetch chats. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            router.replace("/login");
          },
        },
      ]
    );
  };

  const navigateToChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const getOtherParticipant = (chat: Chat) => {
    if (!user || !chat.participants) return null;
    return chat.participants.find((p) => p._id !== user.id);
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const otherParticipant = getOtherParticipant(item);
    const lastMessage = item.lastMessage;

    return (
      <TouchableOpacity 
        style={[styles.chatItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]} 
        onPress={() => navigateToChat(item._id)}
      >
        <View style={styles.avatarContainer}>
          {otherParticipant?.avatar ? (
            <Image
              source={{ uri: otherParticipant.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.border }]}>
              <Ionicons name="person" size={24} color={colors.text} />
            </View>
          )}
        </View>

        <View style={styles.chatInfo}>
          <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
            {otherParticipant?.name || "Unknown User"}
          </Text>
          <Text style={[styles.lastMessage, { color: colors.text }]} numberOfLines={1}>
            {lastMessage?.content || "No messages yet"}
          </Text>
        </View>

        <View style={styles.chatMeta}>
          <Text style={[styles.time, { color: colors.text }]}>
            {formatTime(lastMessage?.timestamp || item.updatedAt)}
          </Text>
          {lastMessage && (
            <View style={[styles.messageIndicator, { backgroundColor: colors.border }]}>
              <Ionicons 
                name={lastMessage.sender._id === user?.id ? "checkmark-done" : "chatbubble"} 
                size={12} 
                color={lastMessage.sender._id === user?.id ? colors.primary : colors.text} 
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading your chats...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Nuvyra</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => router.push('/search')} 
            style={styles.headerButton}
          >
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/profile')} 
            style={styles.headerButton}
          >
            <Ionicons name="person" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={60} color={colors.text} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No chats yet</Text>
            <Text style={[styles.emptySubText, { color: colors.text }]}>
              Start a conversation by searching for people
            </Text>
            <TouchableOpacity 
              style={[styles.searchPeopleButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/search')}
            >
              <Text style={styles.searchPeopleText}>Search People</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity 
        style={[styles.newChatButton, { backgroundColor: colors.primary }]} 
        onPress={() => router.push('/search')}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </TouchableOpacity>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
    borderBottomWidth: 1,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "bold" 
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  chatInfo: { 
    flex: 1,
    marginRight: 12,
  },
  chatName: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 4 
  },
  lastMessage: { 
    fontSize: 14, 
  },
  chatMeta: {
    alignItems: "flex-end",
  },
  time: { 
    fontSize: 12,
    marginBottom: 4,
  },
  messageIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 40,
    marginTop: 100,
  },
  emptyText: { 
    fontSize: 18, 
    marginTop: 16,
    fontWeight: "bold",
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    marginHorizontal: 20,
  },
  searchPeopleButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchPeopleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  newChatButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

});