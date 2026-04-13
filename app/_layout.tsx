// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return <Stack />;
// }
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

function RootNav() {
  const { user, loading } = useAuth();
  const { isReady } = useTheme();

  if (loading || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootNav />
      </ThemeProvider>
    </AuthProvider>
  );
}