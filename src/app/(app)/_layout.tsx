import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Projects" }} />
      <Stack.Screen
        name="project/[id]"
        options={{ title: "Project Details", headerBackTitle: "Back" }}
      />
    </Stack>
  );
}
