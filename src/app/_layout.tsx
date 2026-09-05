import { Slot } from "expo-router";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { View, Text } from "react-native";
import "../global.css";

function RootLayoutNav() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading...</Text>
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
