// app/settings.tsx (updated)
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
  const { theme, setTheme, actualTheme } = useTheme();
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
    <ScrollView style={[styles.container, actualTheme === 'dark' && styles.darkContainer]}>
      <View style={[styles.header, actualTheme === 'dark' && styles.darkHeader]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={actualTheme === 'dark' ? '#fff' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, actualTheme === 'dark' && styles.darkText]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.section, actualTheme === 'dark' && styles.darkSection]}>
        <Text style={[styles.sectionTitle, actualTheme === 'dark' && styles.darkText]}>Appearance</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, actualTheme === 'dark' && styles.darkSettingItem]}
          onPress={() => handleThemeChange('light')}
        >
          <Ionicons name="sunny-outline" size={24} color={actualTheme === 'dark' ? '#fff' : '#333'} />
          <Text style={[styles.settingText, actualTheme === 'dark' && styles.darkText]}>Light Theme</Text>
          {theme === 'light' && <Ionicons name="checkmark" size={20} color="#4CAF50" />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, actualTheme === 'dark' && styles.darkSettingItem]}
          onPress={() => handleThemeChange('dark')}
        >
          <Ionicons name="moon-outline" size={24} color={actualTheme === 'dark' ? '#fff' : '#333'} />
          <Text style={[styles.settingText, actualTheme === 'dark' && styles.darkText]}>Dark Theme</Text>
          {theme === 'dark' && <Ionicons name="checkmark" size={20} color="#4CAF50" />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, actualTheme === 'dark' && styles.darkSettingItem]}
          onPress={() => handleThemeChange('auto')}
        >
          <Ionicons name="phone-portrait-outline" size={24} color={actualTheme === 'dark' ? '#fff' : '#333'} />
          <Text style={[styles.settingText, actualTheme === 'dark' && styles.darkText]}>System Default</Text>
          {theme === 'auto' && <Ionicons name="checkmark" size={20} color="#4CAF50" />}
        </TouchableOpacity>
      </View>

      <View style={[styles.section, actualTheme === 'dark' && styles.darkSection]}>
        <Text style={[styles.sectionTitle, actualTheme === 'dark' && styles.darkText]}>Account</Text>
        <TouchableOpacity 
          style={[styles.settingItem, actualTheme === 'dark' && styles.darkSettingItem]}
          onPress={() => router.push('/change-password')}
        >
          <Ionicons name="lock-closed-outline" size={24} color={actualTheme === 'dark' ? '#fff' : '#333'} />
          <Text style={[styles.settingText, actualTheme === 'dark' && styles.darkText]}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, actualTheme === 'dark' && styles.darkSection]}>
        <Text style={[styles.sectionTitle, actualTheme === 'dark' && styles.darkText]}>Preferences</Text>
        <View style={[styles.settingItem, actualTheme === 'dark' && styles.darkSettingItem]}>
          <Ionicons name="notifications-outline" size={24} color={actualTheme === 'dark' ? '#fff' : '#333'} />
          <Text style={[styles.settingText, actualTheme === 'dark' && styles.darkText]}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#4CAF50" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={[styles.section, actualTheme === 'dark' && styles.darkSection]}>
        <Text style={[styles.sectionTitle, actualTheme === 'dark' && styles.darkText]}>Privacy & Security</Text>
        <View style={[styles.settingItem, actualTheme === 'dark' && styles.darkSettingItem]}>
          <Ionicons name="shield-checkmark-outline" size={24} color={actualTheme === 'dark' ? '#fff' : '#333'} />
          <Text style={[styles.settingText, actualTheme === 'dark' && styles.darkText]}>Private Account</Text>
          <Switch
            value={privacyEnabled}
            onValueChange={setPrivacyEnabled}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={privacyEnabled ? "#4CAF50" : "#f4f3f4"}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, actualTheme === 'dark' && styles.darkLogoutButton]} 
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  darkContainer: { backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  darkHeader: { borderBottomColor: "#333" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  darkText: { color: "#fff" },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  darkSection: { borderBottomColor: "#333" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#666",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  darkSettingItem: { borderBottomColor: "#333" },
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
    backgroundColor: "#fff0f0",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ff3b30",
  },
  darkLogoutButton: { backgroundColor: "#1a1a1a" },
  logoutText: {
    marginLeft: 16,
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "bold",
  },
});