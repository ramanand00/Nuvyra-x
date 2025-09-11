// app/profile.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "./contexts/ThemeContext";

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
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
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  // Get initials if no avatar
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "??";

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.profileSection,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" }]}>
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
                {initials}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.userEmail, { color: colors.text }]}>{user?.email}</Text>
        <Text style={[styles.userMobile, { color: colors.text }]}>{user?.mobile}</Text>
      </View>

      <View style={[styles.menuSection, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
        >
          <Ionicons name="person-outline" size={24} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => router.push("/change-password")}
        >
          <Ionicons name="lock-closed-outline" size={24} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/settings")}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.logoutButton,
          { backgroundColor: colors.card, borderColor: colors.danger },
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileSection: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  userEmail: { fontSize: 16, marginBottom: 2 },
  userMobile: { fontSize: 16 },
  menuSection: {
    padding: 16,
    marginTop: 16,
    borderRadius: 10,
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    margin: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "bold",
  },
});
