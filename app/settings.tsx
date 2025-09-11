// app/settings.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "./contexts/ThemeContext";

export default function Settings() {
  const router = useRouter();
  const { theme, setTheme, colors, actualTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyEnabled, setPrivacyEnabled] = useState(false);

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

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={() => handleThemeChange('light')}
        >
          <Ionicons name="sunny-outline" size={24} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>Light Theme</Text>
          {theme === 'light' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={() => handleThemeChange('dark')}
        >
          <Ionicons name="moon-outline" size={24} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>Dark Theme</Text>
          {theme === 'dark' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={() => handleThemeChange('auto')}
        >
          <Ionicons name="phone-portrait-outline" size={24} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>System Default</Text>
          {theme === 'auto' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={() => router.push('/change-password')}
        >
          <Ionicons name="lock-closed-outline" size={24} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={notificationsEnabled ? colors.primary : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Security</Text>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>Private Account</Text>
          <Switch
            value={privacyEnabled}
            onValueChange={setPrivacyEnabled}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={privacyEnabled ? colors.primary : "#f4f3f4"}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.danger }]} 
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  section: {
    padding: 16,
    marginTop: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingText: {
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