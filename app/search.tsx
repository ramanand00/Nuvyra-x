// app/search.tsx (updated)
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config/constants";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  mobile?: string;
}

export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      Alert.alert("Error", "Please enter at least 2 characters to search");
      return;
    }

    setLoading(true);
    setSearchPerformed(true);
    
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `${API_BASE_URL}/users/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.users);
      } else {
        Alert.alert("Error", data.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Error", "Failed to search users");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (user: User) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId: user._id }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/chat/${data.chat._id}`);
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Start chat error:", error);
      Alert.alert("Error", "Failed to start chat");
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => startChat(item)}>
      <Image
        source={{ uri: item.avatar || "https://via.placeholder.com/50" }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        {item.mobile && <Text style={styles.userMobile}>{item.mobile}</Text>}
      </View>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => startChat(item)}
      >
        <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search People</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchUsers}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchUsers}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            searchPerformed ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No users found</Text>
                <Text style={styles.emptySubText}>
                  Try searching with a different name or email
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Search for users</Text>
                <Text style={styles.emptySubText}>
                  Enter a name or email to find people to chat with
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20 
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    marginRight: 16,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  userEmail: { fontSize: 14, color: "#666", marginBottom: 2 },
  userMobile: { fontSize: 14, color: "#666" },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginHorizontal: 20,
  },
});