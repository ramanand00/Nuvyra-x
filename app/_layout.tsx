// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("userToken");
      setIsLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName={isLoggedIn ? "home" : "login"}
      />
    </ThemeProvider>
  );
}