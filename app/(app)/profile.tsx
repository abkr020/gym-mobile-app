import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>{user?.email}</Text>

      <View style={styles.buttonContainer}>
        <Button color={colors.danger} title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
  },
});