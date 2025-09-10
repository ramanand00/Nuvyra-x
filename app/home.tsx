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
  RefreshControl
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "./config/constants";

interface Chat {
  _id: string;
  participants: any[];
  lastMessage: {
    content: string;
    timestamp: string;
  };
}

export default function Home() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    fetchChats();
  }, []);

  const loadUserData = async () => {
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const fetchChats = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      console.log("Fetching chats from:", `${API_BASE_URL}/chats`);
      
      const response = await fetch(`${API_BASE_URL}/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if we got a response
      if (!response) {
        throw new Error("No response from server");
      }

      const data = await response.json();

      if (response.ok) {
        setChats(data.chats);
      } else {
        Alert.alert("Error", data.message);
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

  const renderChatItem = ({ item }: { item: Chat }) => {
    // Get the other participant (not the current user)
    const otherParticipant = item.participants.find(
      (p) => p._id !== user?.id
    );

    return (
      <TouchableOpacity 
        style={styles.chatItem} 
        onPress={() => navigateToChat(item._id)}
      >
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color="#666" />
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>
            {otherParticipant?.name || "Unknown User"}
          </Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.content || "No messages yet"}
          </Text>
        </View>
        <Text style={styles.time}>
          {item.lastMessage 
            ? new Date(item.lastMessage.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : ''
          }
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => router.push('/search')} 
            style={styles.headerButton}
          >
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/settings')} 
            style={styles.headerButton}
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleLogout} 
            style={styles.headerButton}
          >
            <Ionicons name="log-out-outline" size={24} color="#333" />
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
            colors={["#4CAF50"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No chats yet</Text>
            <Text style={styles.emptySubText}>
              Start a conversation by searching for people
            </Text>
            <TouchableOpacity 
              style={styles.searchPeopleButton}
              onPress={() => router.push('/search')}
            >
              <Text style={styles.searchPeopleText}>Search People</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.newChatButton} 
        onPress={() => router.push('/search')}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => router.push('/profile')}
      >
        <Ionicons name="person" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  chatInfo: { 
    flex: 1 
  },
  chatName: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 4 
  },
  lastMessage: { 
    fontSize: 14, 
    color: "#666" 
  },
  time: { 
    fontSize: 12, 
    color: "#999" 
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
    color: "#666",
    marginTop: 16,
    fontWeight: "bold",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    marginHorizontal: 20,
  },
  searchPeopleButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
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
    backgroundColor: "#4CAF50",
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
  profileButton: {
    position: "absolute",
    left: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2196F3",
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