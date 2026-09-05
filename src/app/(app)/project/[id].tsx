import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../providers/AuthProvider";

type Resource = {
  id: string;
  type: "text" | "photo";
  content: string;
  created_at: string;
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();

  const fetchResources = useCallback(async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Error", "Could not load resources");
    } else {
      setResources(data || []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    const load = async () => {
      await fetchResources();
    };
    load();
  }, [fetchResources]);

  async function addTextNote() {
    if (!noteText.trim()) return;
    setIsSaving(true);

    const { data, error } = await supabase
      .from("resources")
      .insert([{ project_id: id, type: "text", content: noteText.trim() }])
      .select();

    if (error) {
      Alert.alert("Error", error.message);
    } else if (data) {
      setResources([data[0], ...resources]);
      setNoteText("");
      setModalVisible(false);
    }
    setIsSaving(false);
  }

  async function pickAndUploadImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0].uri) {
      return;
    }

    setIsSaving(true);
    try {
      const uri = result.assets[0].uri;
      const ext = uri.substring(uri.lastIndexOf(".") + 1);
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${user?.id}/${fileName}`;

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: fileName,
        type: `image/${ext}`,
      } as any);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(filePath, formData);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("resources")
        .getPublicUrl(filePath);

      // Save to Database
      const { data, error: dbError } = await supabase
        .from("resources")
        .insert([
          { project_id: id, type: "photo", content: publicUrlData.publicUrl },
        ])
        .select();

      if (dbError) throw dbError;

      if (data) {
        setResources([data[0], ...resources]);
      }
    } catch (error: any) {
      Alert.alert("Upload Error", error.message);
    } finally {
      setIsSaving(false);
    }
  }

  const renderItem = ({ item }: { item: Resource }) => (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-slate-100">
      {item.type === "text" ? (
        <Text className="text-base text-slate-800">{item.content}</Text>
      ) : (
        <Image
          source={{ uri: item.content }}
          className="w-full h-48 rounded-lg"
          resizeMode="cover"
        />
      )}
      <Text className="text-xs text-slate-400 mt-2 text-right">
        {new Date(item.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="mt-10 items-center">
              <Text className="text-slate-500 text-center">
                No ideas captured yet.
              </Text>
            </View>
          }
        />
      )}

      {/* Sticky Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 flex-row justify-around pb-8">
        <TouchableOpacity
          className="bg-blue-100 px-6 py-3 rounded-full flex-row items-center"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-blue-700 font-semibold">📝 Add Note</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-indigo-100 px-6 py-3 rounded-full flex-row items-center"
          onPress={pickAndUploadImage}
          disabled={isSaving}
        >
          <Text className="text-indigo-700 font-semibold">
            {isSaving ? "Uploading..." : "📷 Add Photo"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Text Capture Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/40"
        >
          <View className="bg-white rounded-t-3xl p-6 shadow-xl h-1/2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-800">New Note</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-slate-500 text-base font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="flex-1 text-base text-slate-800"
              placeholder="What's your idea?"
              multiline
              autoFocus
              value={noteText}
              onChangeText={setNoteText}
              textAlignVertical="top"
            />
            <TouchableOpacity
              className={`py-4 rounded-xl items-center mt-4 ${noteText.trim() ? "bg-blue-600" : "bg-slate-300"}`}
              onPress={addTextNote}
              disabled={!noteText.trim() || isSaving}
            >
              <Text className="text-white font-bold text-lg">
                {isSaving ? "Saving..." : "Save Note"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
