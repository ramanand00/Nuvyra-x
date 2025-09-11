// app/login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "./config/constants";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // NEW: Toggle password visibility

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Connecting to:", `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
        Alert.alert("Success", "Login successful");
        router.replace("/home");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Connection Error", 
        `Failed to connect to server at ${API_BASE_URL}.\n\nPlease make sure:\n1. Backend server is running\n2. Both devices are on same WiFi\n3. Correct IP address is configured`
      );
    } finally {
      setLoading(false);
    }
  };

  const goToSignup = () => {
    router.push("/signup");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword} // Toggle password visibility
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(prev => !prev)}
        >
          <Text style={styles.showPasswordText}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signupButton} onPress={goToSignup}>
        <Text style={styles.signupButtonText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 10, marginBottom: 15 },
  passwordContainer: { flexDirection: "row", alignItems: "center", position: "relative" },
  showPasswordButton: { paddingHorizontal: 10, justifyContent: "center" },
  showPasswordText: { color: "#007BFF", fontWeight: "bold" },
  button: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
  disabledButton: { backgroundColor: "#cccccc" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  signupButton: { marginTop: 15, alignItems: "center" },
  signupButtonText: { color: "#007BFF", fontSize: 16 },
});
