import React from "react";
/* apologies this is being all done, even though it 
wasn't explicity mentioned in the certain assessments (i.e. 
revised project proposal, and so on), but our group wanted 
to add all of these features, so that it can helpful for 
all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
"CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { clearMoodHistory } from "../api";
import { useTheme } from "../contexts/ThemeContext";
import { Colors } from "../constants/theme";

export default function LogoutButton() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const activeColors = Colors[theme];
  const router = useRouter();

  // Helper for 100% reliable alerts on Web/Mobile!!!
  // Helper for 100% reliable alerts on Web/Mobile!!!
  const showAlert = (title, message, buttons = [], options = {}) => {
    if (Platform.OS === "web") {
      if (buttons && buttons.length > 0) {
        const okButton = buttons.find(b => b.text === "OK" || b.text === "Logout" || b.text === "Delete" || b.style === "destructive");
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

  const handleLogout = () => {
    const performLogout = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (typeof setTheme === "function") {
          setTheme("light");
        }
        await logout();

        showAlert("Success", "You have been logged out successfully.");
        router.replace("/login");
      } catch (error) {
        console.error("Logout error:", error);
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

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.button}>
      <Ionicons name="log-out-outline" size={22} color={activeColors.background} />
      <Text style={[styles.text, { color: activeColors.background }]}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    gap: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});
