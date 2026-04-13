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
import { api } from "../../services/api";

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [pushups, setPushups] = useState("");
  const [pullups, setPullups] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => createProfileStyles(theme), [theme]);

  const openModal = async () => {
    setModalVisible(true);
    // Fetch latest record
    const record = await api.getLatestRecord(token);
    if (record) {
      setPushups(record.pushups?.toString() || "");
      setPullups(record.pullups?.toString() || "");
      setIsEditing(true);
      setRecordId(record.id);
    } else {
      setPushups("");
      setPullups("");
      setIsEditing(false);
      setRecordId(null);
    }
  };

  const handleSaveRecord = async () => {

    // console.log("--handleSaveRecord--");
    // showAlert("handleSaveRecord", "function start");

    const body: any = {};
    if (pushups) body.pushups = parseInt(pushups);
    if (pullups) body.pullups = parseInt(pullups);

    let res;
    if (isEditing && recordId) {
      res = await api.updateDailyRecord(recordId, token, body.pushups, body.pullups);
    } else {
      res = await api.addDailyRecord(token, body.pushups, body.pullups);
    }

    if (res) {
      setModalVisible(false);
      setPushups("");
      setPullups("");
      setIsEditing(false);
      setRecordId(null);
    }
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
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => { }}
          >
            <Text style={styles.modalTitle}>
              {isEditing ? "Update Daily Record" : "Add Daily Record"}
            </Text>

            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString()}
              </Text>
              {isEditing && recordId && (
                <Text style={styles.idText}>ID: {recordId}</Text>
              )}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Pushups"
              placeholderTextColor={theme.mutedText}
              keyboardType="number-pad"
              value={pushups}
              onChangeText={setPushups}
              selectTextOnFocus={true}
            />

            <TextInput
              style={styles.input}
              placeholder="Pullups"
              placeholderTextColor={theme.mutedText}
              keyboardType="number-pad"
              value={pullups}
              onChangeText={setPullups}
              selectTextOnFocus={true}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveRecord}
              >
                <Text style={styles.saveButtonText}>
                  {isEditing ? "Update" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: "85%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 8,
    },
    modalTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 20,
      textAlign: "center",
    },
    dateContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    dateText: {
      color: theme.mutedText,
      fontSize: 16,
    },
    idText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: "600",
    },
    input: {
      backgroundColor: theme.surface,
      borderColor: theme.inputBorder,
      borderWidth: 1,
      borderRadius: 12,
      color: theme.text,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
      fontSize: 16,
    },
    modalButtonContainer: {
      flexDirection: "row",
      gap: 12,
      marginTop: 20,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.inputBorder,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    cancelButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "600",
    },
    saveButton: {
      flex: 1,
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    saveButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "600",
    },
  });
