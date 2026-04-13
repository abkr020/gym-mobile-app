import { router } from "expo-router";
import { useState } from "react";
import {
  Button,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const insets = useSafeAreaInsets();

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

      {/* Sidebar */}
      {sidebarVisible && (

        <TouchableOpacity
          style={styles.sidebarOverlay}
          onPress={() => setSidebarVisible(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={[styles.sidebar, { paddingBottom: Math.max(insets.bottom, 20) }]}
            activeOpacity={1}
            onPress={() => { }}
          >
            <>
              {/* TOP SECTION */}
              <View>
                <View style={styles.sidebarHeader}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSidebarVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.userInfo}>
                  <Image
                    source={{ uri: 'https://via.placeholder.com/80x80?text=👤' }}
                    style={styles.userImage}
                  />
                  <Text style={styles.userName}>{user?.name || 'User'}</Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                <View style={styles.sidebarMenu}>
                  <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuItemText}>👤 Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuItemText}>⚙️ Settings</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* BOTTOM SECTION */}
              <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuItemText}>Edit Login Info</Text>
                </TouchableOpacity>

                <View style={styles.buttonContainer}>
                  <Button
                    color={colors.danger}
                    title="Logout"
                    onPress={handleLogout}
                  />
                </View>
              </View>
            </>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    // justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: "center",
    // marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 20,
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
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  sidebar: {
    width: "70%",
    backgroundColor: colors.card,
    paddingTop: 50,
    paddingHorizontal: 20,
    // paddingBottom: 20,
    justifyContent: "space-between", // 👈 ADD THIS
    // paddingBottom: Math.max(insets.bottom, 20), // 👈 respects nav bar


  },
  sidebarHeader: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.inputBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "bold",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
  },
  userEmail: {
    color: colors.mutedText,
    fontSize: 14,
  },
  sidebarMenu: {
    gap: 10,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  menuItemText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  bottomActions: {
    gap: 10,
  },
});