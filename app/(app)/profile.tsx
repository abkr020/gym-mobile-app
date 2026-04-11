import { router } from "expo-router";
import { useState } from "react";
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [pushups, setPushups] = useState("");
  const [pullups, setPullups] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

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
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>{user?.email}</Text>

      <View style={styles.buttonContainer}>
        <Button color={colors.danger} title="Logout" onPress={handleLogout} />
      </View>

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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
              placeholderTextColor={colors.mutedText}
              keyboardType="number-pad"
              value={pushups}
              onChangeText={setPushups}
            />

            <TextInput
              style={styles.input}
              placeholder="Pullups"
              placeholderTextColor={colors.mutedText}
              keyboardType="number-pad"
              value={pullups}
              onChangeText={setPullups}
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  fab: {
    position: "absolute",
    bottom: 50,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
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
    color: colors.text,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.card,
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
    color: colors.text,
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
    color: colors.mutedText,
    fontSize: 16,
  },
  idText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
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
    backgroundColor: colors.inputBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});