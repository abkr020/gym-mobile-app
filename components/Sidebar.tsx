import Constants from "expo-constants";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export function Sidebar({
  visible,
  onClose,
}: SidebarProps) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleProfilePress = () => {
    onClose();
  };

  const handleSettingsPress = () => {
    onClose();
  };

    if (!visible) {
        return null;
    }

    return (
        <TouchableOpacity
            style={styles.overlay}
            onPress={onClose}
            activeOpacity={1}
        >
            <TouchableOpacity
                style={[styles.sidebar, { backgroundColor: theme.card, paddingBottom: Math.max(insets.bottom, 20) }]}
                activeOpacity={1}
                onPress={() => { }}
            >
                <View style={styles.content}>

                    <View style={styles.topRow}>
                        <TouchableOpacity style={[styles.themeButton, { borderColor: theme.inputBorder }]} onPress={toggleTheme}>
                            <Text style={[styles.themeButtonText, { color: theme.text }]}> {themeMode === "dark" ? "🌙 Dark" : "☀️ Light"} </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.inputBorder }]} onPress={onClose}>
                            <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userInfo}>
                        <Image
                            source={{ uri: "https://via.placeholder.com/80x80?text=USER" }}
                            style={styles.userImage}
                        />
                        <Text style={[styles.userName, { color: theme.text }]}>{user?.name || "Gym Member"}</Text>
                        <Text style={[styles.userEmail, { color: theme.mutedText }]}>{user?.email || "user@example.com"}</Text>
                    </View>

                    <View style={styles.menuSection}>
                        <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.background }]} onPress={handleProfilePress}>
                            <Text style={[styles.menuItemText, { color: theme.text }]}>👤 Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.background }]} onPress={handleSettingsPress}>
                            <Text style={[styles.menuItemText, { color: theme.text }]}>⚙️ Settings</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.background }]} onPress={handleLogout}>
                            <Text style={[styles.menuItemText, { color: theme.text }]}>Logout</Text>
                        </TouchableOpacity>
                        <Text style={[styles.versionText, { color: theme.mutedText }]}>v{Constants.expoConfig?.version + " - auto" || "1.0.1 - manual"}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    overlay: {
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
        paddingTop: 50,
        paddingHorizontal: 20,
        //   flex: 1, // 👈 VERY IMPORTANT

        // justifyContent: "space-between",
    },
    content: {
        flex: 1,
        flexDirection: "column",
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // marginBottom: 20,
    },
    themeButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    themeButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: "700",
    },
    userInfo: {
        alignItems: "center",
        marginBottom: 30,
    },
    userImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        // marginBottom: 12,
    },
    userName: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    menuSection: {
        gap: 12,
    },
    menuItem: {
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 14,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: "600",
    },
    footer: {
        // marginTop: 30,
          marginTop: "auto",


    },
    versionText: {
        fontSize: 12,
        textAlign: "center",
        marginTop: 10,
    },
});
