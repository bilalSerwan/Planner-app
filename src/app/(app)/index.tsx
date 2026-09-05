import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../providers/AuthProvider";

type Project = {
  id: string;
  title: string;
  created_at: string;
};

export default function HomeScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Error fetching projects", error.message);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchProjects();
    };
    load();
  }, [fetchProjects]);

  async function createProject() {
    if (!newProjectTitle.trim()) return;

    setIsCreating(true);
    const { data, error } = await supabase
      .from("projects")
      .insert([{ title: newProjectTitle.trim(), user_id: user?.id }])
      .select();

    if (error) {
      Alert.alert("Error creating project", error.message);
    } else if (data) {
      setNewProjectTitle("");
      setProjects([data[0], ...projects]);
    }
    setIsCreating(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const renderItem = ({ item }: { item: Project }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-slate-100"
      onPress={() => router.push(`/project/${item.id}` as any)}
    >
      <Text className="text-lg font-semibold text-slate-800">{item.title}</Text>
      <Text className="text-xs text-slate-500 mt-1">
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-slate-900">Your Projects</Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-slate-200 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-slate-700 text-sm font-medium">Logout</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-6">
        <TextInput
          className="flex-1 bg-white border border-slate-200 rounded-l-lg px-4 py-3 text-slate-900"
          placeholder="New Project Title"
          value={newProjectTitle}
          onChangeText={setNewProjectTitle}
        />
        <TouchableOpacity
          className="bg-blue-600 px-4 justify-center items-center rounded-r-lg"
          onPress={createProject}
          disabled={isCreating}
        >
          <Text className="text-white font-bold">
            {isCreating ? "..." : "Add"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
      ) : projects.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-slate-500 text-base">
            No projects yet. Create one above!
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
