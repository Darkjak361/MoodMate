import React, { useState, useEffect, useRef } from "react";
// MoodMate Login - 100% Mobile Compatible & Theme-Synced! 🌗📱
// This screen automatically matches your device's system appearance (Dark/Light). ✅
/* apologies this is being all done, even though it 
wasn't explicity mentioned in the certain assessments (i.e. 
revised project proposal, and so on), but our group wanted 
to add all of these features, so that it can helpful for 
all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
"CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! 
ALSO, WE JUST ADDED THE "PASSWORD EYE ICON VISIBILITY TOGGLE" AND THE 
"AUTOMATIC INVISIBILITY RESET" FOR ALL PASSWORDS WHEN SWITCHING FOR 100% SECURITY, ALL 
100%!!! */
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments, useFocusEffect } from "expo-router";
import { register, login } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Colors } from "../constants/theme";

export default function LoginScreen() {
  const { theme } = useTheme();
  const activeColors = Colors[theme];
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const { login: authLogin } = useAuth();

  // Helper function for 100% reliable alerts on Web and Mobile!!!
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

  // 100% Professional Form Reset Logic!!!
  const resetFormFields = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setName("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };


  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = isLogin ? "Login Page - MoodMate" : "Sign Up Page - MoodMate";
    }
  }, [isLogin]);

  useEffect(() => {
    // 100% Professional Global Sync Logic!!!
    const currentSegment = segments[0];
    const isSignupUrl = currentSegment === "signup";
    const isLoginUrl = currentSegment === "login";

    if (isSignupUrl && isLogin) {
      console.log("🔄 [Sync] URL is signup, switching UI to Signup mode");
      setIsLogin(false);
      resetFormFields();
    } else if (isLoginUrl && !isLogin) {
      console.log("🔄 [Sync] URL is login, switching UI to Login mode");
      setIsLogin(true);
      resetFormFields();
    }
  }, [segments]);


  const handleSubmit = async () => {
    console.log("=== Login/Sign Up Button Clicked ===");
    console.log("isLogin:", isLogin);
    console.log("email:", email);
    console.log("password:", password ? "***" : "empty");
    console.log("name:", name);
    console.log("username:", username);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanPassword) {
      showAlert("Error", "Please fill in all required fields");
      return;
    }

    // 100% Professional Email Regex Validation!!!
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      showAlert("Error", "Please enter a valid email address (example: user@email.com)");
      return;
    }

    // 100% Professional Password Length Validation!!!
    if (cleanPassword.length < 6) {
      showAlert("Error", "Password must be at least 6 characters long for 100% security");
      return;
    }

    if (!isLogin) {
      if (!cleanName || !cleanUsername) {
        showAlert("Error", "Please fill in all required fields");
        return;
      }

      // 100% Professional Name Length Validation!!!
      if (cleanName.length < 2) {
        showAlert("Error", "Full Name must be at least 2 characters long");
        return;
      }

      // 100% Professional Username Format Validation!!!
      if (cleanUsername.length < 3) {
        showAlert("Error", "Username must be at least 3 characters long");
        return;
      }
      if (/\s/.test(cleanUsername)) {
        showAlert("Error", "Username cannot contain spaces");
        return;
      }

      // 100% Professional Password Match Validation!!!
      if (cleanPassword !== confirmPassword.trim()) {
        showAlert("Error", "Passwords do not match! Please check again.");
        return;
      }
    }

    setLoading(true);
    console.log("Starting authentication...");

    try {
      let response;
      if (isLogin) {
        console.log("Attempting login...");
        response = await login(cleanEmail, cleanPassword);
      } else {
        console.log("Attempting registration...");
        response = await register(cleanUsername, cleanEmail, cleanPassword, cleanName);
      }

      console.log("Response received:", response);

      if (response.token && response.user) {
        console.log("✅ Authentication successful!");

        if (!isLogin) {
          setLoading(false);
          showAlert(
            "Success",
            "Account created successfully! Please login with your credentials."
          );
          setIsLogin(true);
          setEmail("");
          setPassword("");
          setName("");
          setUsername("");
          router.replace("/login");
          return;
        }

        await authLogin(response.user, response.token);
      } else {
        console.log("❌ Authentication failed:", response.error);
        showAlert("Error", response.error || "Authentication failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      const errorMessage = error.message || "Something went wrong. Please check your connection and try again.\n\nMake sure:\n1. Backend server is running on port 5001\n2. MongoDB is configured in backend/.env";
      showAlert("Error", errorMessage);
      setLoading(false);
    }
  };


  return (
    <LinearGradient colors={activeColors.gradient} style={[styles.container, { backgroundColor: activeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: activeColors.text }]}>🧠 MoodMate</Text>
          <Text style={[styles.subtitle, { color: activeColors.secondary }]}>
            {isLogin ? "Welcome back! 👋" : "Create your account 👋"}
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <>
              <Text style={[styles.label, { color: activeColors.text }]}>Full Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: activeColors.card, borderColor: activeColors.border, color: activeColors.text }]}
                placeholder="Enter your name"
                placeholderTextColor={activeColors.secondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <Text style={[styles.label, { color: activeColors.text }]}>Username *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: activeColors.card, borderColor: activeColors.border, color: activeColors.text }]}
                placeholder="Choose a username"
                placeholderTextColor={activeColors.secondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </>
          )}

          <Text style={[styles.label, { color: activeColors.text }]}>Email *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: activeColors.card, borderColor: activeColors.border, color: activeColors.text }]}
            placeholder="Enter your email"
            placeholderTextColor={activeColors.secondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: activeColors.text }]}>Password *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, paddingRight: 50, backgroundColor: activeColors.card, borderColor: activeColors.border, color: activeColors.text }]}
              placeholder="Enter your password"
              placeholderTextColor={activeColors.secondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color={activeColors.secondary}
              />
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <>
              <Text style={[styles.label, { color: activeColors.text }]}>Confirm Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, paddingRight: 50, backgroundColor: activeColors.card, borderColor: activeColors.border, color: activeColors.text }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={activeColors.secondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color={activeColors.secondary}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: activeColors.tint, borderColor: activeColors.border }, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={activeColors.background} />
            ) : (
              <Text style={[styles.buttonText, { color: activeColors.background }]}>
                {isLogin ? "Login" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <View style={[styles.forgotCredentialsContainer, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
              <Text style={[styles.forgotCredentialsText, { color: activeColors.text }]}>
                Did you Sign Up for an account, or did you forget your email or password,
                or did you forget both of your credentials instead?
              </Text>
              <Text style={[styles.forgotCredentialsSubtext, { color: activeColors.secondary }]}>
                Click the following Sign Up button, then Sign Up for another account again:
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              const newIsLogin = !isLogin;
              resetFormFields();
              // 100% Professional Router Navigation!!!
              const destination = newIsLogin ? "/login" : "/signup";
              console.log(`🚀 [Navigation] Switching to: ${destination}`);
              router.replace(destination);
              setIsLogin(newIsLogin);
            }}
          >
            <Text style={[styles.switchText, { color: activeColors.tint }]}>
              {isLogin
                ? "Sign Up"
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    height: "100%",
    justifyContent: "center",
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchText: {
    fontSize: 16,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  forgotCredentialsContainer: {
    marginTop: 30,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
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
  forgotCredentialsText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 8,
  },
  forgotCredentialsSubtext: {
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
  },
});
