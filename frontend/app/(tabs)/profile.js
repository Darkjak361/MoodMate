import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert, Platform, Modal, TextInput } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Colors } from "../../constants/theme";
import { getSettings, updateSettings, deleteUser } from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

// Foreground notification display config (only for mobile)
if (Platform.OS !== "web") {
    try {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });
    } catch (e) { }
}

export default function ProfileScreen() {
    const [notifications, setNotifications] = useState(false);
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isAndroidPasswordModalVisible, setIsAndroidPasswordModalVisible] = useState(false);
    const [androidConfirmPassword, setAndroidConfirmPassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const { user, logout } = useAuth();
    const { theme, toggleTheme, setTheme } = useTheme();
    const activeColors = Colors[theme];
    const router = useRouter();

    const showAlert = (title, message, buttons = [], options = {}) => {
        if (Platform.OS === "web") {
            if (buttons && buttons.length > 0) {
                const okButton = buttons.find(b => b.style === "destructive" || b.text === "OK" || b.text === "Logout" || b.text === "Delete");
                const cancelButton = buttons.find(b => b.style === "cancel" || b.text === "Cancel");
                if (window.confirm(`${title}: ${message}`)) {
                    if (okButton && okButton.onPress) okButton.onPress();
                } else {
                    if (cancelButton && cancelButton.onPress) cancelButton.onPress();
                }
            } else {
                alert(`${title}: ${message}`);
            }
        } else {
            const finalButtons = (buttons && buttons.length > 0) ? buttons : [{ text: "OK" }];
            Alert.alert(title, message, finalButtons, options);
        }
    };

    // Mobile-only notification functions
    const enableNotifications = async () => {
        if (Platform.OS === "web") return false;

        try {
            const hour = 9;
            const minute = 0;

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                showAlert("Permission Required", "⚠️ Please ensure app notifications are allowed in system settings.");
                return false;
            }
            await Notifications.cancelAllScheduledNotificationsAsync();
            setTimeout(async () => {
                try {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "MoodMate Reminder",
                            body: "Time to check in with your mood! How are you feeling today?",
                            sound: true,
                            priority: 'max',
                            vibrate: [0, 250, 250, 250],
                        },
                        trigger: null,
                    });
                } catch (e) { console.warn("Confirmation notification failed:", e); }
            }, 2000);
            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "MoodMate Reminder",
                        body: "Time to check in with your mood! How are you feeling today?",
                        sound: true,
                    },
                    trigger: { hour, minute, repeats: true },
                });
            } catch (e) {
                console.warn("Exact scheduling blocked, using JS fallback.");
            }
            await updateSettings({ dailyReminders: true, notificationHour: hour, notificationMinute: minute });
            setNotifications(true);
            return true;
        } catch (error) {
            console.error("Notification setup error:", error);
            showAlert("Error", `Failed to setup notifications: ${error.message || error}`);
            setNotifications(false);
            return false;
        }
    };

    const disableNotifications = async () => {
        if (Platform.OS === "web") return;

        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            await updateSettings({ dailyReminders: false });
            setNotifications(false);
        } catch (error) {
            console.error("Failed to disable notifications:", error);
            setNotifications(true);
        }
    };

    const loadSettings = async () => {
        try {
            const settings = await getSettings();
            if (settings?.dailyReminders !== undefined) {
                setNotifications(settings.dailyReminders);
            }
            setSettingsLoaded(true);
        } catch (error) {
            setSettingsLoaded(true);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleNotificationToggle = async (value) => {
        if (Platform.OS === "web") return;

        if (!value) {
            setShowConfirmModal(false);
            await disableNotifications();
        } else {
            setNotifications(true);
            setShowConfirmModal(true);
            try {
                await updateSettings({ dailyReminders: true });
            } catch (error) {
                console.error("Failed to update settings:", error);
            }
        }
    };

    const handleConfirmYes = async () => {
        if (Platform.OS === "web") return;
        await enableNotifications();

    };


    const handleConfirmNo = async () => {
        if (Platform.OS === "web") return;
        setShowConfirmModal(false);
        setNotifications(false);
        try {
            await updateSettings({ dailyReminders: false });
        } catch (error) {
            console.error("Failed to update settings:", error);
        }
    };

    const handleLogout = () => {
        const performLogout = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                await logout();
                showAlert("Success", "You have been logged out successfully.");
                router.replace("/login");
            } catch (error) {
                showAlert("Error", error.message || "Failed to logout.");
            }
        };

        showAlert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: performLogout }
            ]
        );
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const handleDeleteAccount = async (password) => {
        const passwordToUse = password || androidConfirmPassword;
        if (!passwordToUse) {
            showAlert("Error", "Please enter your password.");
            return;
        }

        setIsDeleting(true);
        try {
            await deleteUser(passwordToUse);
            if (Platform.OS !== "web") {
                await disableNotifications();
            }
            setTheme("light");
            await AsyncStorage.removeItem("userTheme");
            setIsAndroidPasswordModalVisible(false);
            setAndroidConfirmPassword("");
            showAlert("Success", "Account deleted successfully.");
            await new Promise(resolve => setTimeout(resolve, 800));
            await logout();
            router.replace("/login");
        } catch (error) {
            showAlert("Error", error.message || "Incorrect password.");
        } finally {
            setIsDeleting(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (Platform.OS === "web") {
                document.title = "Profile Page - MoodMate";
            }
        }, [])
    );

    if (!settingsLoaded) {
        return <View style={{ flex: 1, backgroundColor: activeColors.background }} />;
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: activeColors.background }]}>
            <View style={[styles.profileHeader, { backgroundColor: activeColors.tint, borderBottomWidth: 1.5, borderBottomColor: activeColors.border }]}>
                <View style={[styles.avatar, { backgroundColor: activeColors.background, borderColor: activeColors.border }]}>
                    <Text style={[styles.avatarText, { color: activeColors.tint }]}>{getInitials(user?.name)}</Text>
                </View>
                <Text style={[styles.name, { color: activeColors.background }]}>{user?.name || "User"} ({user?.username || "Username"})</Text>
                <Text style={[styles.email, { color: activeColors.background, opacity: 0.9 }]}>{user?.email || "user@moodmate.com"}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                <Text style={[styles.cardTitle, { color: activeColors.text }]}>Settings</Text>

                <View style={styles.settingRow}>
                    <View>
                        <Text style={[styles.settingLabel, { color: activeColors.text }]}>Light Mode or Dark Mode</Text>
                        <Text style={[styles.settingDescription, { color: activeColors.secondary }]}>Switch between Light and Dark themes.</Text>
                    </View>
                    <Switch
                        value={theme === "dark"}
                        onValueChange={toggleTheme}
                        trackColor={{ false: activeColors.border, true: activeColors.tint }}
                        thumbColor={theme === "dark" ? activeColors.tint : activeColors.background}
                    />
                </View>

                {/* Reminder section - ONLY SHOWN ON MOBILE (iOS/Android), HIDDEN ON WEB */}
                {Platform.OS !== "web" && (
                    <>
                        <View style={styles.settingRow}>
                            <View>
                                <Text style={[styles.settingLabel, { color: activeColors.text }]}>Reminder(s)</Text>
                                <Text style={[styles.settingDescription, { color: activeColors.secondary }]}>Get notified to check in with your mood.</Text>
                            </View>
                            <Switch
                                value={notifications}
                                onValueChange={handleNotificationToggle}
                                trackColor={{ false: activeColors.border, true: activeColors.tint }}
                                thumbColor={notifications ? activeColors.tint : activeColors.background}
                            />
                        </View>

                        {/* ✅ CHANGE 3: Replaced showConfirmModal with (notifications || showConfirmModal) */}
                        {(notifications || showConfirmModal) && (
                            <View style={[styles.confirmBox, { borderTopColor: activeColors.border }]}>
                                <Text style={[styles.confirmTitle, { color: activeColors.text }]}>Enable Reminders?</Text>
                                <Text style={[styles.confirmText, { color: activeColors.secondary }]}>
                                    Enable daily check-in notifications to help track your well-being.
                                    {"\n\n"}Note: Notifications are only optimized for all iOS / Android Mobile Devices. Press 'Yes' multiple times for 100% consistency. Keep multiple device reminders for 100% awareness and never miss notifications!
                                </Text>
                                <View style={styles.confirmButtons}>
                                    <TouchableOpacity style={[styles.confirmButtonNo, { backgroundColor: activeColors.card, borderColor: activeColors.border }]} onPress={handleConfirmNo}>
                                        <Text style={[styles.confirmButtonTextNo, { color: activeColors.text }]}>No</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.confirmButtonYes, { backgroundColor: activeColors.success, borderColor: activeColors.border }]} onPress={handleConfirmYes}>
                                        <Text style={[styles.confirmButtonTextYes, { color: activeColors.background }]}>Yes</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </>
                )}

                {/* Web-only message */}
                {Platform.OS === "web" && (
                    <View style={styles.noteBox}>
                        <Text style={[styles.noteText, { color: activeColors.secondary }]}>
                            💡 Note: Daily reminders are available on the mobile app (iOS/Android). Download the app to enable push notifications!
                        </Text>
                    </View>
                )}
            </View>

            {/* Rest of your existing cards */}
            <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                <Text style={[styles.cardTitle, { color: activeColors.text }]}>Safety & Ethics</Text>
                <Text style={[styles.aboutText, { color: activeColors.text }]}>
                    MoodMate uses AI to provide supportive insights. These are not a substitute for professional medical advice, diagnosis, or treatment.
                </Text>
                <Text style={[styles.disclaimerText, { color: activeColors.secondary }]}>
                    If you are in a crisis, please reach out to local emergency services or a mental health professional immediately.
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                <Text style={[styles.cardTitle, { color: activeColors.text }]}>About</Text>
                <Text style={[styles.aboutText, { color: activeColors.text }]}>
                    MoodMate is your AI-powered companion for tracking and understanding your emotional well-being.
                </Text>
                <Text style={[styles.version, { color: activeColors.secondary }]}>Version 1.0.0</Text>
            </View>

            <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                <Text style={[styles.cardTitle, { color: activeColors.text }]}>Account</Text>
                <TouchableOpacity
                    style={[styles.deleteAccountButton, { backgroundColor: activeColors.error, borderColor: activeColors.border }]}
                    onPress={() => {
                        if (Platform.OS === "web") {
                            const pwd = window.prompt("Enter password to confirm account deletion:");
                            if (pwd) handleDeleteAccount(pwd);
                        } else if (Platform.OS === "ios") {
                            Alert.prompt("Confirm Password", "Enter your password to delete your account:", [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: (pwd) => pwd && handleDeleteAccount(pwd) }
                            ], "secure-text");
                        } else {
                            setIsAndroidPasswordModalVisible(true);
                        }
                    }}
                >
                    <Text style={[styles.deleteAccountText, { color: activeColors.background }]}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            {/* Android Password Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isAndroidPasswordModalVisible}
                onRequestClose={() => setIsAndroidPasswordModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="warning" size={32} color={activeColors.error} />
                            <Text style={[styles.modalTitle, { color: activeColors.text }]}>Confirm Password</Text>
                        </View>
                        <Text style={[styles.modalDescription, { color: activeColors.text }]}>
                            Enter your password to permanently delete your account. This action cannot be undone.
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.passwordInput, { backgroundColor: activeColors.background, color: activeColors.text, borderColor: activeColors.border }]}
                                placeholder="Enter password"
                                placeholderTextColor={activeColors.secondary}
                                secureTextEntry
                                value={androidConfirmPassword}
                                onChangeText={setAndroidConfirmPassword}
                                autoFocus
                            />
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.cancelBtn, { borderColor: activeColors.border }]} onPress={() => {
                                setIsAndroidPasswordModalVisible(false);
                                setAndroidConfirmPassword("");
                            }}>
                                <Text style={[styles.cancelBtnText, { color: activeColors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: '#6366f1' }]} onPress={() => handleDeleteAccount()} disabled={isDeleting}>
                                <Text style={styles.deleteBtnText}>{isDeleting ? "Deleting..." : "Delete"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    profileHeader: { padding: 30, alignItems: "center", borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", borderWidth: 2.5 },
    avatarText: { fontSize: 28, fontWeight: "bold" },
    name: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
    email: { fontSize: 14 },
    card: { margin: 20, padding: 20, borderRadius: 20, borderWidth: 1.5 },
    cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
    settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
    settingLabel: { fontSize: 16, fontWeight: "600" },
    settingDescription: { fontSize: 12, marginTop: 3 },
    noteBox: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
    noteText: { fontSize: 12, fontStyle: "italic", lineHeight: 16 },
    confirmBox: { marginTop: 20, paddingTop: 20, borderTopWidth: 1.5 },
    confirmTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
    confirmText: { fontSize: 13, lineHeight: 18, marginBottom: 15 },
    confirmButtons: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    confirmButtonNo: { flex: 1, padding: 14, borderRadius: 10, alignItems: "center", borderWidth: 1.5 },
    confirmButtonYes: { flex: 1, padding: 14, borderRadius: 10, alignItems: "center", borderWidth: 1.5 },
    confirmButtonTextNo: { fontSize: 16, fontWeight: "600" },
    confirmButtonTextYes: { fontSize: 16, fontWeight: "600" },
    aboutText: { fontSize: 14, lineHeight: 20, marginBottom: 15 },
    version: { fontSize: 12 },
    disclaimerText: { fontSize: 12, fontStyle: "italic", marginTop: 5 },
    deleteAccountButton: { padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10, borderWidth: 1.5 },
    deleteAccountText: { fontSize: 16, fontWeight: "600" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalContent: { width: "90%", maxWidth: 400, padding: 24, borderRadius: 16, borderWidth: 1.5, elevation: 10 },
    modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
    modalTitle: { fontSize: 20, fontWeight: "bold" },
    modalDescription: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
    inputContainer: { marginBottom: 24 },
    passwordInput: { padding: 14, borderRadius: 12, borderWidth: 1.5, fontSize: 16 },
    modalButtons: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
    cancelBtn: { minWidth: 90, padding: 12, borderRadius: 30, alignItems: "center", borderWidth: 1.5 },
    cancelBtnText: { fontSize: 15, fontWeight: "600" },
    deleteBtn: { minWidth: 90, padding: 12, borderRadius: 30, alignItems: "center" },
    deleteBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});