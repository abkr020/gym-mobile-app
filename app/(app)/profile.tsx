import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Check initial connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOnline = isOnline;
      setIsOnline(state.isConnected ?? true);
      // If coming back online, sync pending data
      if (state.isConnected && !wasOnline) {
        syncPendingData();
      }
    });

    // Initial sync check
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected ?? true);
    });

    // Check for pending records
    checkPendingRecords();

    return () => unsubscribe();
  }, []);

  const checkPendingRecords = async () => {
    try {
      const existingData = await AsyncStorage.getItem("pendingRecords");
      if (existingData) {
        const pendingRecords = JSON.parse(existingData);
        setPendingCount(pendingRecords.length);
      }
    } catch (error) {
      console.error("Error checking pending records:", error);
    }
  };

  const saveLocally = async (data: any) => {
    try {
      const existingData = await AsyncStorage.getItem("pendingRecords");
      const pendingRecords = existingData ? JSON.parse(existingData) : [];
      pendingRecords.push({
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
      await AsyncStorage.setItem("pendingRecords", JSON.stringify(pendingRecords));
      setPendingCount(pendingRecords.length);
    } catch (error) {
      console.error("Error saving locally:", error);
    }
  };

  const syncPendingData = async () => {
    try {
      const existingData = await AsyncStorage.getItem("pendingRecords");
      if (!existingData) return;

      const pendingRecords = JSON.parse(existingData);
      if (pendingRecords.length === 0) return;

      for (const record of pendingRecords) {
        try {
          if (record.isUpdate && record.recordId) {
            await api.updateDailyRecord(record.recordId, token, record.pushups, record.pullups);
          } else {
            await api.addDailyRecord(token, record.pushups, record.pullups);
          }
        } catch (error) {
          console.error("Error syncing record:", error);
          // Keep failed records for retry
          continue;
        }
      }

      // Clear synced records
      await AsyncStorage.removeItem("pendingRecords");
      setPendingCount(0);
      console.log("Synced pending records successfully");
    } catch (error) {
      console.error("Error syncing pending data:", error);
    }
  };

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
    const body: any = {};
    if (pushups) body.pushups = parseInt(pushups);
    if (pullups) body.pullups = parseInt(pullups);

    if (!isOnline) {
      // Save locally when offline
      await saveLocally({
        pushups: body.pushups,
        pullups: body.pullups,
        isUpdate: isEditing,
        recordId: recordId
      });

      setModalVisible(false);
      setPushups("");
      setPullups("");
      setIsEditing(false);
      setRecordId(null);

      alert("No internet connection. Data saved locally and will sync when online.");
      return;
    }

    // Online - save to server
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

      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>
            ⚠️ Offline - {pendingCount} record{pendingCount !== 1 ? 's' : ''} waiting to sync
          </Text>
        </View>
      )}

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
              placeholderTextColor={colors.mutedText}
              keyboardType="number-pad"
              value={pushups}
              onChangeText={setPushups}
              selectTextOnFocus={true}
            />

            <TextInput
              style={styles.input}
              placeholder="Pullups"
              placeholderTextColor={colors.mutedText}
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
  offlineIndicator: {
    backgroundColor: colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
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