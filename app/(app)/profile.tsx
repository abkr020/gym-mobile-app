import { useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sidebar } from "../../components/Sidebar";
import { ThemeColors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { DailyRecordForm } from "@/components/DailyRecordForm";

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => createProfileStyles(theme), [theme]);

  const openModal = () => {
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Profile Icon */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => setSidebarVisible(true)}
        >
          <Text style={styles.profileIconText}>👤</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>{user?.email}</Text>



      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openModal}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal for adding daily record */}
      <DailyRecordForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </SafeAreaView>
  );
}

const createProfileStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 24,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "700",
    },
    profileIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.card,
      justifyContent: "center",
      alignItems: "center",
    },
    profileIconText: {
      fontSize: 20,
    },
    subtitle: {
      color: theme.mutedText,
      fontSize: 16,
      marginBottom: 24,
    },
    buttonContainer: {
      width: "100%",
    },
    fab: {
      position: "absolute",
      bottom: 50,
      right: 30,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 8,
    },
    fabText: {
      fontSize: 32,
      color: theme.text,
      fontWeight: "bold",
    },

  });
