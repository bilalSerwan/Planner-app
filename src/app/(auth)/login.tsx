import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signInWithOtp() {
    if (!email) {
      Alert.alert("Please enter your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setIsOtpSent(true);
      Alert.alert("Success", "Check your email for the verification code");
    }
    setLoading(false);
  }

  async function verifyOtp() {
    if (!otp) {
      Alert.alert("Please enter the OTP");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: "email",
    });

    if (error) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <Text className="text-3xl font-bold mb-8 text-center text-slate-800">
        Idea Capture
      </Text>

      {!isOtpSent ? (
        <View className="space-y-4">
          <Text className="text-sm font-medium text-slate-600 mb-1">
            Email Address
          </Text>
          <TextInput
            className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-900 mb-4"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity
            className="w-full bg-blue-600 rounded-lg py-3 flex items-center justify-center mb-6"
            onPress={signInWithOtp}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? "Sending..." : "Continue with Email"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="space-y-4">
          <Text className="text-sm font-medium text-slate-600 mb-1">
            Verification Code
          </Text>
          <TextInput
            className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-900 mb-4"
            placeholder="123456"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            className="w-full bg-blue-600 rounded-lg py-3 flex items-center justify-center mb-6"
            onPress={verifyOtp}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? "Verifying..." : "Verify Code"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsOtpSent(false)}>
            <Text className="text-center text-blue-600 font-medium">
              Use a different email
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-row items-center my-6">
        <View className="flex-1 h-[1px] bg-slate-200" />
        <Text className="mx-4 text-slate-400 font-medium text-sm">OR</Text>
        <View className="flex-1 h-[1px] bg-slate-200" />
      </View>

      <TouchableOpacity
        className="w-full border border-slate-300 rounded-lg py-3 flex items-center justify-center mb-4 bg-white"
        onPress={() =>
          Alert.alert("Google Sign-In", "Google Sign-In placeholder")
        }
      >
        <Text className="text-slate-700 font-semibold text-base">
          Continue with Google
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <TouchableOpacity
          className="w-full bg-black rounded-lg py-3 flex items-center justify-center"
          onPress={() =>
            Alert.alert("Apple Sign-In", "Apple Sign-In placeholder")
          }
        >
          <Text className="text-white font-semibold text-base">
            Continue with Apple
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
