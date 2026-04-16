import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemeColors } from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../services/api";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const DailyRecordForm = ({ visible, onClose }: Props) => {
  const { theme } = useTheme();
  const { token } = useAuth();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [pushups, setPushups] = useState("");
  const [pullups, setPullups] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  // Fetch latest record when modal opens
  useEffect(() => {
    if (!visible) return;

    const fetchData = async () => {
      const record = await api.getTodaysRecord(token);

      if (record) {
        setPushups(record.pushups?.toString() || "");
        setPullups(record.pullups?.toString() || "");
        setIsEditing(true);
        setRecordId(record.id ? record.id.toString() : null);
      } else {
        setPushups("");
        setPullups("");
        setIsEditing(false);
        setRecordId(null);
      }
    };

    fetchData();
  }, [visible]);

  // 🔥 Moved here
  const handleSaveRecord = async () => {
    const body: any = {};

    if (pushups) body.pushups = parseInt(pushups);
    if (pullups) body.pullups = parseInt(pullups);

    let res;

    if (isEditing && recordId) {
      res = await api.updateDailyRecord(
        recordId,
        token,
        body.pushups,
        body.pullups
      );
    } else {
      res = await api.addDailyRecord(
        token,
        body.pushups,
        body.pullups
      );
    }

    if (res) {
      // reset state
      setPushups("");
      setPullups("");
      setIsEditing(false);
      setRecordId(null);

      onClose(); // close modal
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
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
              onPress={onClose}
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
  );
};

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
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
      marginBottom: 20,
    },
    dateText: {
      color: theme.mutedText,
    },
    idText: {
      color: theme.primary,
      fontWeight: "600",
    },
    input: {
      backgroundColor: theme.surface,
      borderColor: theme.inputBorder,
      borderWidth: 1,
      borderRadius: 12,
      color: theme.text,
      padding: 12,
      marginBottom: 16,
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
      padding: 12,
      alignItems: "center",
    },
    cancelButtonText: {
      color: theme.text,
      fontWeight: "600",
    },
    saveButton: {
      flex: 1,
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
    },
    saveButtonText: {
      color: theme.text,
      fontWeight: "600",
    },
  });