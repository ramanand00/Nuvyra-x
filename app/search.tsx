// app/search.tsx
import React, { useState, useEffect } from "react";
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
  SectionList,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config/constants";
import { useTheme } from "./contexts/ThemeContext";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  mobile?: string;
}

interface Contact {
  _id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
  avatar?: string;
}

export default function Search() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'contacts'>('search');

  useEffect(() => {
    if (activeTab === 'contacts') {
      loadContacts();
    }
  }, [activeTab]);

  const loadContacts = async () => {
    try {
      // In a real app, you would use react-native-contacts or similar
      // For now, we'll use mock data or fetch from your backend
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/users/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Load contacts error:", error);
      // Mock contacts for demo
      setContacts([
        {
          _id: '1',
          name: 'John Doe',
          phoneNumbers: ['+1234567890'],
          emails: ['john@example.com'],
        },
        {
          _id: '2',
          name: 'Jane Smith',
          phoneNumbers: ['+0987654321'],
          emails: ['jane@example.com'],
        },
      ]);
    }
  };

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

  const startChat = async (user: User | Contact) => {
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

  const inviteContact = (contact: Contact) => {
    Alert.alert(
      "Invite to ChatApp",
      `Invite ${contact.name} to join ChatApp?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send Invite", onPress: () => sendInvitation(contact) },
      ]
    );
  };

  const sendInvitation = async (contact: Contact) => {
    // Implement SMS/email invitation logic here
    Alert.alert("Invitation Sent", `Invitation sent to ${contact.name}`);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={[styles.userItem, { backgroundColor: colors.card }]} 
      onPress={() => startChat(item)}
    >
      <Image
        source={{ uri: item.avatar || "https://via.placeholder.com/50" }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.userEmail, { color: colors.text }]}>{item.email}</Text>
        {item.mobile && <Text style={[styles.userMobile, { color: colors.text }]}>{item.mobile}</Text>}
      </View>
      <TouchableOpacity
        style={[styles.chatButton, { backgroundColor: colors.primary }]}
        onPress={() => startChat(item)}
      >
        <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={[styles.userItem, { backgroundColor: colors.card }]}
      onPress={() => inviteContact(item)}
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color="#666" />
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
        {item.phoneNumbers[0] && (
          <Text style={[styles.userEmail, { color: colors.text }]}>
            {item.phoneNumbers[0]}
          </Text>
        )}
        {item.emails[0] && (
          <Text style={[styles.userMobile, { color: colors.text }]}>
            {item.emails[0]}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.inviteButton, { backgroundColor: colors.secondary }]}
        onPress={() => inviteContact(item)}
      >
        <Ionicons name="person-add" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const sections = [
    {
      title: "Search Results",
      data: searchResults,
      renderItem: renderUserItem,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Search People</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, { color: colors.text }]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}
        >
          <Text style={[styles.tabText, { color: colors.text }]}>Contacts</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'search' ? (
        <>
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Search by name or email..."
              placeholderTextColor={colors.text}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchUsers}
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={[styles.searchButton, { backgroundColor: colors.primary }]} 
              onPress={searchUsers}
            >
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>Searching...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderUserItem}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={
                searchPerformed ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={60} color={colors.text} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>No users found</Text>
                    <Text style={[styles.emptySubText, { color: colors.text }]}>
                      Try searching with a different name or email
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={60} color={colors.text} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>Search for users</Text>
                    <Text style={[styles.emptySubText, { color: colors.text }]}>
                      Enter a name or email to find people to chat with
                    </Text>
                  </View>
                )
              }
            />
          )}
        </>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color={colors.text} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No contacts found</Text>
              <Text style={[styles.emptySubText, { color: colors.text }]}>
                Your contacts will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20 
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#4CAF50",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
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
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    marginRight: 16,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 2 },
  userMobile: { fontSize: 14 },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  inviteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontWeight: "bold",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    marginHorizontal: 20,
  },
});