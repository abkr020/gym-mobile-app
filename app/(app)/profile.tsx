import { DailyRecordForm } from "@/components/DailyRecordForm";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DailyRecordsChart } from "../../components/DailyRecordsChart";
import { Sidebar } from "../../components/Sidebar";
import { ThemeColors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../services/api";

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const styles = useMemo(() => createProfileStyles(theme), [theme]);

  useEffect(() => {
    loadRecords();
  }, [token]);

  const loadRecords = async () => {
    setLoading(true);
    const data = await api.getAllRecords(token, 30);
    setRecords(data);
    setLoading(false);
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const handleFormClose = async () => {
    setModalVisible(false);
    await loadRecords();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Profile Icon */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>{user?.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => setSidebarVisible(true)}
          >
            <Text style={styles.profileIconText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Records Chart */}
        {loading ? (
          <View style={[styles.loadingContainer, { backgroundColor: theme.card }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.mutedText }]}>
              Loading your records...
            </Text>
          </View>
        ) : (
          <DailyRecordsChart records={records} theme={theme} />
        )}
      </ScrollView>

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
        onClose={handleFormClose}
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
      marginBottom: 20,
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
      marginTop: 4,
    },
    loadingContainer: {
      borderRadius: 12,
      padding: 32,
      marginVertical: 12,
      justifyContent: "center",
      alignItems: "center",
      minHeight: 250,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: "500",
    },
    fab: {
      position: "absolute",
      bottom: 30,
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
