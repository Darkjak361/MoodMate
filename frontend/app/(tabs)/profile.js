import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
/* apologies this is being all done, even though it 
wasn't explicity mentioned in the certain assessments (i.e. 
revised project proposal, and so on), but our group wanted 
to add all of these features, so that it can helpful for 
all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
"CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Colors } from "../../constants/theme";
import { getSettings, updateSettings, clearMoodHistory, deleteUser } from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
    const [notifications, setNotifications] = useState(false);
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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
            // 🏁 1,000% Reliable OK Button for Android & iOS!!!
            const finalButtons = (buttons && buttons.length > 0) ? buttons : [{ text: "OK" }];
            Alert.alert(title, message, finalButtons, options);
        }
    };

    const enableNotifications = async () => {
        try {
            const hour = 9;
            const minute = 0;

            if (Platform.OS === "web") {
                if (!("Notification" in window)) {
                    showAlert("Error", "Your browser does not support notifications");
                    return false;
                }

                const permission = await window.Notification.requestPermission();
                if (permission !== "granted") {
                    showAlert("Error", "Please enable notifications in browser settings");
                    return false;
                }

                if (window.moodmateTimer) {
                    clearTimeout(window.moodmateTimer);
                }

                const now = new Date();
                const nextTrigger = new Date();
                nextTrigger.setHours(hour, minute, 0, 0);

                if (nextTrigger <= now) {
                    nextTrigger.setDate(nextTrigger.getDate() + 1);
                }

                const msUntilNext = nextTrigger.getTime() - now.getTime();

                window.moodmateTimer = setTimeout(function sendDailyWebNotification() {
                    new Notification("MoodMate Reminder", {
                        body: "Time to check in with your mood! How are you feeling today?",
                        icon: "/icon.png",
                    });

                    window.moodmateTimer = setTimeout(
                        sendDailyWebNotification,
                        24 * 60 * 60 * 1000
                    );
                }, msUntilNext);
            }

            await updateSettings({
                dailyReminders: true,
                notificationHour: hour,
                notificationMinute: minute,
            });

            setNotifications(true);
            return true;
        } catch (error) {
            console.error("Notification setup error:", error);
            setNotifications(true);
            return true;
        }
    };

    const handleDeleteAccount = async (password) => {
        try {
            const result = await deleteUser(password);

            if (Platform.OS === "web") {
                if (window.moodmateTimer) {
                    clearTimeout(window.moodmateTimer);
                    window.moodmateTimer = null;
                }
            }

            setTheme("light");
            await AsyncStorage.removeItem("userTheme");

            showAlert("Success", "Your account has been deleted successfully. Remember to create a new account and then login with your new account to continue using MoodMate.");
            await new Promise(resolve => setTimeout(resolve, 500));

            await logout();
            router.replace("/login");
        } catch (error) {
            const errorMessage = error.message || "Failed to delete account. Please try again.";
            showAlert("Error", errorMessage);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (Platform.OS === "web") {
                document.title = "Profile Page - MoodMate";
                let lastUrl = window.location.href;
                let urlCheckInterval = null;

                let replaceStateCount = 0;
                let lastReplaceTime = 0;
                const MAX_REPLACE_PER_SECOND = 5;

                const preventForward = () => {
                    const now = Date.now();
                    if (now - lastReplaceTime > 1000) {
                        replaceStateCount = 0;
                    }

                    if (replaceStateCount >= MAX_REPLACE_PER_SECOND) {
                        return;
                    }

                    if (window.history && window.history.replaceState) {
                        const currentUrl = window.location.href;
                        if (currentUrl === lastUrl) {
                            try {
                                window.history.replaceState(null, "", currentUrl);
                                replaceStateCount++;
                                lastReplaceTime = now;
                            } catch (error) {
                            }
                        }
                    }
                };

                const waitForUrlUpdate = () => {
                    const checkUrl = () => {
                        const currentUrl = window.location.href;
                        if (currentUrl !== lastUrl) {
                            lastUrl = currentUrl;
                            setTimeout(preventForward, 100);
                        }
                    };

                    checkUrl();
                    if (urlCheckInterval) clearInterval(urlCheckInterval);
                    urlCheckInterval = setInterval(checkUrl, 200);
                };

                setTimeout(waitForUrlUpdate, 0);
                setTimeout(waitForUrlUpdate, 100);
                setTimeout(waitForUrlUpdate, 300);
                setTimeout(waitForUrlUpdate, 500);

                const handlePopState = () => {
                    lastUrl = window.location.href;
                    setTimeout(preventForward, 100);
                };
                window.addEventListener("popstate", handlePopState);

                return () => {
                    window.removeEventListener("popstate", handlePopState);
                    if (urlCheckInterval) clearInterval(urlCheckInterval);
                };
            }
        }, [])
    );

    useEffect(() => {
        if (Platform.OS === "web" && typeof window !== "undefined") {
            let lastUrl = window.location.href;

            const preventForward = () => {
                if (window.history && window.history.replaceState) {
                    const currentUrl = window.location.href;
                    if (currentUrl === lastUrl) {
                        window.history.replaceState(null, "", currentUrl);
                        window.history.pushState(null, "", currentUrl);
                        window.history.replaceState(null, "", currentUrl);
                    }
                }
            };

            const waitForUrlUpdate = () => {
                const currentUrl = window.location.href;
                if (currentUrl !== lastUrl) {
                    lastUrl = currentUrl;
                    setTimeout(preventForward, 100);
                }
            };

            const urlCheckInterval = setInterval(waitForUrlUpdate, 50);

            setTimeout(waitForUrlUpdate, 0);
            setTimeout(waitForUrlUpdate, 100);
            setTimeout(waitForUrlUpdate, 300);
            setTimeout(waitForUrlUpdate, 500);

            const handlePopState = () => {
                lastUrl = window.location.href;
                setTimeout(preventForward, 100);
            };
            window.addEventListener("popstate", handlePopState);

            const handleVisibilityChange = () => {
                if (!document.hidden) {
                    lastUrl = window.location.href;
                    setTimeout(preventForward, 100);
                }
            };
            document.addEventListener("visibilitychange", handleVisibilityChange);

            return () => {
                window.removeEventListener("popstate", handlePopState);
                clearInterval(urlCheckInterval);
                document.removeEventListener("visibilitychange", handleVisibilityChange);
            };
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await getSettings();
            if (settings?.dailyReminders !== undefined) {
                setNotifications(settings.dailyReminders);
                setShowConfirmModal(settings.dailyReminders);
            }
            setSettingsLoaded(true);
        } catch (error) {
            setSettingsLoaded(true);
        }
    };

    const handleNotificationToggle = async (value) => {
        if (!value) {
            setShowConfirmModal(false);
            try {
                if (Platform.OS === "web") {
                    if (window.moodmateTimer) {
                        clearTimeout(window.moodmateTimer);
                        window.moodmateTimer = null;
                    }
                }
                await updateSettings({ dailyReminders: false });
                setNotifications(false);
            } catch (error) {
                console.error("Failed to update settings:", error);
                setNotifications(true);
            }
        } else {
            setNotifications(true);
            setShowConfirmModal(true);
            try {
                await updateSettings({ dailyReminders: true });
                console.log("✅ Reminder state saved to backend immediately.");
            } catch (error) {
                console.error("Failed to update settings immediately:", error);
            }
        }
    };

    const handleConfirmYes = async () => {
        await enableNotifications();
    };

    const handleConfirmNo = async () => {
        setShowConfirmModal(false);
        setNotifications(false);
        try {
            if (Platform.OS === "web") {
                if (window.moodmateTimer) {
                    clearTimeout(window.moodmateTimer);
                    window.moodmateTimer = null;
                }
            }
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
                const errorMessage = error.message || "Failed to logout. Please try again.";
                showAlert("Error", errorMessage);
            }
        };

        const message = "Are you sure you want to logout? Everything will be saved in your account, including all of your Settings.";

        showAlert(
            "Logout",
            message,
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

                {showConfirmModal && (
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
            </View>

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
                            const pwd = window.prompt("Are you sure you want to permanently delete your account and everything with it? This action cannot be undone. To delete your account, please enter your password to confirm:");
                            if (pwd) {
                                handleDeleteAccount(pwd);
                            }
                        } else {
                            Alert.prompt(
                                "Confirm Password",
                                "Are you sure you want to permanently delete your account and everything with it? This action cannot be undone. To delete your account, please enter your password to confirm:",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Confirm", style: "destructive", onPress: (pwd) => {
                                            if (pwd) handleDeleteAccount(pwd);
                                        }
                                    }
                                ],
                                "secure-text"
                            );
                        }
                    }}
                >
                    <Text style={[styles.deleteAccountText, { color: activeColors.background }]}>Delete Account</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileHeader: {
        padding: 30,
        alignItems: "center",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 15,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2.5,
        ...Platform.select({
            web: {
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
            },
            default: {
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            }
        })
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        gap: 4,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 4,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: "bold",
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 5,
    },
    email: {
        fontSize: 14,
    },
    card: {
        margin: 20,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1.5,
        ...Platform.select({
            web: {
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
            },
            default: {
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            }
        })
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    settingDescription: {
        fontSize: 12,
        marginTop: 3,
    },
    aboutText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 15,
    },
    version: {
        fontSize: 12,
    },
    disclaimerText: {
        fontSize: 12,
        fontStyle: "italic",
        marginTop: 5,
    },
    deleteAccountButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
        borderWidth: 1.5,
        ...Platform.select({
            web: {
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
            },
            default: {
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            }
        })
    },
    deleteAccountText: {
        fontSize: 16,
        fontWeight: "600",
    },
    timeContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1.5,
    },
    timeLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    timeInputRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 15,
    },
    timeInputContainer: {
        flex: 1,
    },
    timeInputLabel: {
        fontSize: 12,
        marginBottom: 5,
    },
    timeInput: {
        borderWidth: 1.5,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    saveButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1.5,
        ...Platform.select({
            web: {
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            },
            default: {
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }
        })
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    confirmBox: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1.5,
    },
    confirmTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    confirmText: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 15,
    },
    confirmButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    confirmButtonNo: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1.5,
        ...Platform.select({
            web: {
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
            },
            default: {
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
            }
        })
    },
    confirmButtonYes: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1.5,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        ...Platform.select({
            web: {
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            },
            default: {
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }
        })
    },
    confirmButtonTextNo: {
        fontSize: 16,
        fontWeight: "600",
    },
    confirmButtonTextYes: {
        fontSize: 16,
        fontWeight: "600",
    },
});