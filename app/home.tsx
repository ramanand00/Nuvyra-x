// app/home.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "./config/constants"; // Import from config

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
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
    router.replace("/login");
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    // Get the other participant (not the current user)
    const otherParticipant = item.participants.find(
      (p) => p._id !== user?.id
    );

    return (
      <TouchableOpacity style={styles.chatItem}>
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
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chats yet</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.newChatButton}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
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
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  lastMessage: { fontSize: 14, color: "#666" },
  time: { fontSize: 12, color: "#999" },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  emptyText: { fontSize: 16, color: "#666" },
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
  },
});