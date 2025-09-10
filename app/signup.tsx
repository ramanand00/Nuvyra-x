// app/signup.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "./config/constants"; // Import from config

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: registration form, 2: verification
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !mobile || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Connecting to:", `${API_BASE_URL}/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, mobile, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2); // Move to verification step
        Alert.alert("Success", "Verification code sent to your email");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      Alert.alert("Error", "Please enter verification code");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Connecting to:", `${API_BASE_URL}/auth/verify`);
      
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, email, mobile, password, 
          code: verificationCode 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Account created successfully");
        router.replace("/login");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert("Error", "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {step === 1 ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Processing..." : "Sign Up"}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.verificationText}>
            Enter the verification code sent to {email}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Verification Code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={verifyCode}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Verify Code"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.link} onPress={goToLogin}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 10, marginBottom: 15 },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  passwordInput: { flex: 1, padding: 12 },
  button: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 10, alignItems: "center" },
  disabledButton: { backgroundColor: "#cccccc" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  link: { marginTop: 15, alignItems: "center" },
  linkText: { color: "#007BFF", fontSize: 16 },
  verificationText: { 
    textAlign: "center", 
    marginBottom: 20, 
    color: "#666" 
  },
});