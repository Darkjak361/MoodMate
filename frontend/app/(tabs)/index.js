import { useState, useEffect } from "react";
/* apologies this is being all done, even though it 
wasn't explicity mentioned in the certain assessments (i.e. 
revised project proposal, and so on), but our group wanted 
to add all of these features, so that it can helpful for 
all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
"CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Animated,
    Platform,
    Alert,
    ScrollView,
    ActivityIndicator,
    Linking
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getMoodHistory, analyzeMood } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Colors } from "../../constants/theme";
import SuggestionBox from "../../components/SuggestionBox";
import DailyInsights from "../../components/DailyInsights";
import BreathingExercise from "../../components/BreathingExercise";
import { queueMoodEntry, syncOfflineEntries } from "../../utils/storageSync";
import { useCallback, useRef } from "react";

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

export default function HomeScreen() {
    const [greeting, setGreeting] = useState("");
    const [selectedMood, setSelectedMood] = useState(null);
    const [text, setText] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showBreathing, setShowBreathing] = useState(false);
    const recognitionRef = useRef(null);
    const initialTextRef = useRef("");
    const [refreshing, setRefreshing] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const { user, logout } = useAuth();
    const { theme, isDark } = useTheme();
    const activeColors = Colors[theme];
    const router = useRouter();
    const inputRef = useRef(null); // Ref for 100% Smart-Mic Focus!!!

    // 🛡️ 1,000,000% Reliable Auto-Sync on Startup!!!
    useEffect(() => {
        const performInitialSync = async () => {
            try {
                await syncOfflineEntries(analyzeMood);
            } catch (e) {
                console.log("Startup sync check failed (expected if offline)");
            }
        };
        performInitialSync();
    }, []);

    // 100% Professional Audio Support Link!!! Works for all devices as a YouTube Video.
    // NOTE: For best mobile experience (iPhone/Android), downloading the YouTube App is highly recommended!
    const calmingAudioUrl = "https://www.youtube.com/watch?v=jfKfPfyJRdk"; // Requested Lofi/Calm

    const updateGreeting = useCallback(() => {
        const hour = new Date().getHours();
        let baseGreeting = "Good morning";
        if (hour < 12) baseGreeting = "Good morning";
        else if (hour < 17) baseGreeting = "Good afternoon";
        else if (hour < 21) baseGreeting = "Good evening";
        else baseGreeting = "Good night";
        setGreeting(`${baseGreeting} 👋`); // 1000% Professional Empathy!!!
    }, []);



    useFocusEffect(
        useCallback(() => {
            updateGreeting();
        }, [updateGreeting])
    );

    useFocusEffect(
        useCallback(() => {
            setResult(null);
            setText("");
            setSelectedMood(null);
        }, [])
    );

    useEffect(() => {
        setResult(null);
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (Platform.OS === "web") {
                document.title = "Analyze Mood Page - MoodMate";
            }
        }, [])
    );

    useEffect(() => {
        updateGreeting();

        const interval = setInterval(() => {
            updateGreeting();
        }, 60000);

        return () => clearInterval(interval);
    }, [updateGreeting]);

    // 100% Professional Pulse Animation!!!
    useEffect(() => {
        if (isListening) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isListening, pulseAnim]);

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

    const handleMicrophone = async () => {
        console.log("🎤 Microphone button pressed. Current state:", { isListening, platform: Platform.OS });
        if (isListening) {
            stopListening();
            return;
        }

        if (Platform.OS === "web") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                showAlert("Speech Not Supported", "Your browser does not support voice-to-text. It is highly recommended that you please use either Google Chrome or Safari for 100% Real Voice functionality!");
                return;
            }

            initialTextRef.current = text;

            if (!recognitionRef.current) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = "en-US";

                recognitionRef.current.onresult = (event) => {
                    let sessionTranscript = "";
                    for (let i = 0; i < event.results.length; i++) {
                        sessionTranscript += event.results[i][0].transcript;
                    }

                    const newText = initialTextRef.current
                        ? initialTextRef.current + (initialTextRef.current.endsWith(" ") ? "" : " ") + sessionTranscript
                        : sessionTranscript;

                    setText(newText);
                    setSelectedMood(null);
                };

                recognitionRef.current.onerror = (event) => {
                    console.error("Speech Error:", event.error);
                    if (event.error === "not-allowed") {
                        showAlert("Mic Required", "Please click 'Allow' on the browser popup to let MoodMate hear your voice! 100%!!!");
                    }
                    stopListening();
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }

            try {
                recognitionRef.current.start();
                setIsListening(true);
                setResult(null);
            } catch (err) {
                console.error("Recognition start error:", err);
                stopListening();
            }
        } else {
            // 100% Smart-Mic Logic for Mobile (Expo Go & Deployment)!!!
            // This focuses the input so the user can use the system keyboard mic
            if (inputRef.current) {
                inputRef.current.focus();
                showAlert("Voice Mode Active", "Your keyboard's microphone is now ready! 🎤\n\nTap the small microphone icon at the bottom of your keyboard to speak your thoughts. 100%!", [{ text: "OK" }]);
            }
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        updateGreeting();
        // Artificial delay for that 100% premium feel!!!
        await new Promise(resolve => setTimeout(resolve, 800));
        setRefreshing(false);
    }, [updateGreeting]);

    const stopListening = async () => {
        if (Platform.OS === "web") {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        }
        setIsListening(false);
    };

    const moods = [
        { emoji: "😊", label: "Happy" },
        { emoji: "😐", label: "Neutral" },
        { emoji: "😔", label: "Sad" },
        { emoji: "😡", label: "Angry" },
        { emoji: "😰", label: "Anxious" },
    ];

    const handleAnalyze = async () => {
        if (!selectedMood && !text.trim()) {
            showAlert("Error", "Please select a mood or type your thoughts / record your thoughts.");
            return;
        }

        setLoading(true);

        try {
            const moodToSend = selectedMood ? selectedMood.toLowerCase() : null;
            const entryData = {
                text: text || selectedMood,
                emojiMood: moodToSend
            };

            const response = await analyzeMood(
                entryData.text,
                { emojiMood: entryData.emojiMood }
            );

            console.log("Analyze response:", response);

            // 100% Advanced Personalization: Trust the dynamic server response!
            let moodInsight = response.entry?.moodInsight || response.result?.moodInsight;

            setResult({
                ...response.result,
                moodInsight: moodInsight,
                timestamp: Date.now()
            });
            setText("");
            setSelectedMood(null);

        } catch (error) {
            console.log("Error analyzing mood, checking for offline queueing:", error);

            // 🛡️ 1,000,000% Professional Reliability Engine!!!
            // If the network fails (backend timeout/offline), we keep the data forever locally!
            const moodToSend = selectedMood ? selectedMood.toLowerCase() : null;
            const queued = await queueMoodEntry({
                text: text || selectedMood,
                emojiMood: moodToSend,
                energyLevel: 50, // Default for offline
            });

            if (queued) {
                showAlert("Sync Active", "Your mood was saved safely in your account's local storage! ⚓️\n\nIt will be fully synchronized as soon as your connection is restored. 100% Reliability!");
                setText("");
                setSelectedMood(null);
            } else {
                showAlert("Error", error.message || "Could not analyze your mood. Please try again.");
            }
        }

        setLoading(false);
    };

    // Auto-sync on load
    useEffect(() => {
        const attemptSync = async () => {
            const result = await syncOfflineEntries(analyzeMood);
            if (result.count > 0) {
                console.log(`✅ Successfully synced ${result.count} offline entries!`);
            }
        };
        attemptSync();
    }, []);

    return (
        <LinearGradient colors={activeColors.gradient} style={{ flex: 1 }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.container, { backgroundColor: "transparent", zIndex: 1 }]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={activeColors.tint}
                        colors={[activeColors.tint]}
                    />
                }
            >
                <View style={styles.topActions}>
                    <TouchableOpacity
                        style={[styles.actionIcon, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
                        onPress={() => setShowBreathing(!showBreathing)}
                    >
                        <Ionicons name={showBreathing ? "close" : "leaf-outline"} size={20} color={activeColors.tint} />
                        <Text style={[styles.actionText, { color: activeColors.text }]}>{showBreathing ? "Close" : "Calm Breath"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionIcon, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
                        onPress={() => Linking.openURL(calmingAudioUrl)}
                    >
                        <Ionicons name="musical-notes-outline" size={20} color={activeColors.tint} />
                        <Text style={[styles.actionText, { color: activeColors.text }]}>Calm Sound</Text>
                    </TouchableOpacity>
                </View>

                {showBreathing && <BreathingExercise />}
                <DailyInsights />
                <View style={styles.headerSection}>
                    <Text style={[styles.greeting, { color: activeColors.text }]}>
                        {greeting}, {user?.name || "User"}!
                    </Text>
                    <Text style={[styles.subtitle, { color: activeColors.secondary }]}>How are you feeling today?</Text>
                </View>

                <View style={styles.moodRow}>
                    {moods.map((m) => (
                        <TouchableOpacity
                            key={m.label}
                            style={[
                                styles.moodButton,
                                selectedMood === m.label && { backgroundColor: activeColors.tint + '40' },
                                text.trim().length > 0 && styles.moodButtonDisabled,
                                { borderColor: activeColors.border }
                            ]}
                            onPress={() => {
                                if (text.trim().length === 0) {
                                    if (selectedMood === m.label) {
                                        setSelectedMood(null);
                                    } else {
                                        setSelectedMood(m.label);
                                        setText("");
                                    }
                                }
                            }}
                            disabled={text.trim().length > 0}
                        >
                            <Text style={styles.moodEmoji}>{m.emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 100% Professional Separator: --------------------OR------------------- */}
                <View style={styles.separatorContainer}>
                    <View style={[styles.separatorLine, { backgroundColor: activeColors.border }]} />
                    <Text style={[styles.separatorText, { color: activeColors.secondary }]}>OR</Text>
                    <View style={[styles.separatorLine, { backgroundColor: activeColors.border }]} />
                </View>

                {isListening && (
                    <View style={styles.listeningIndicator}>
                        <Ionicons name="mic" size={16} color={activeColors.tint} />
                        <Text style={[styles.listeningText, { color: activeColors.tint }]}>Listening...</Text>
                    </View>
                )}
                <View style={styles.inputWrapper}>
                    <TextInput
                        ref={inputRef}
                        placeholder={`Type something / Record something...\nNote: It is highly recommended that you please use either Google Chrome or Safari for 100% Real Voice functionality!`}
                        placeholderTextColor={activeColors.secondary}
                        style={[
                            styles.input,
                            selectedMood && styles.inputDisabled,
                            { color: activeColors.text, borderColor: activeColors.border }
                        ]}
                        value={text}
                        onFocus={() => console.log("⌨️ TextInput focused. Editable:", !selectedMood)}
                        onChangeText={(newText) => {
                            console.log("⌨️ TextInput change:", newText);
                            setText(newText);
                            if (newText.trim().length > 0) {
                                setSelectedMood(null);
                                setResult(null);
                            }
                        }}
                        multiline
                        editable={!selectedMood}
                    />
                    <TouchableOpacity
                        style={[styles.micIcon, { backgroundColor: isListening ? activeColors.error : activeColors.tint, borderColor: activeColors.border }]}
                        onPress={handleMicrophone}
                    >
                        {isListening ? (
                            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                <Ionicons name="mic" size={22} color={activeColors.background} />
                            </Animated.View>
                        ) : (
                            <Ionicons name="mic-outline" size={22} color={activeColors.background} />
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.submitBtn,
                        loading && { opacity: 0.5 },
                        { backgroundColor: isListening ? activeColors.error : activeColors.tint, borderColor: activeColors.border }
                    ]}
                    disabled={loading}
                    onPress={isListening ? stopListening : handleAnalyze}
                >
                    {loading ? (
                        <ActivityIndicator color={activeColors.background} />
                    ) : (
                        <Text style={[styles.submitText, { color: activeColors.background }]}>
                            {isListening ? "DONE / STOP RECORDING" : "Analyze Mood"}
                        </Text>
                    )}
                </TouchableOpacity>

                {result && <SuggestionBox mood={result.mood} timestamp={result.timestamp} moodInsight={result.moodInsight} />}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 10 },
    topActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    actionIcon: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
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
    actionText: {
        fontSize: 12,
        fontWeight: "600",
    },
    headerSection: {
        marginBottom: 20,
    },
    greeting: { fontSize: 22, fontWeight: "500", marginBottom: 4 },
    subtitle: { fontSize: 14, marginBottom: 0 },

    moodRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
    },

    moodButton: {
        width: 55,
        height: 55,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        ...Platform.select({
            web: {
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
            },
            default: {
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            }
        })
    },
    moodButtonDisabled: {
        opacity: 0.5,
    },
    inputDisabled: {
        opacity: 0.6,
    },
    moodEmoji: { fontSize: 26 },

    or: { textAlign: "center", marginVertical: 10, fontSize: 13, fontWeight: "400" },

    inputWrapper: {
        position: "relative",
        marginTop: 10,
    },
    input: {
        borderRadius: 12,
        padding: 12,
        paddingRight: 50,
        fontSize: 15,
        minHeight: 120,
        borderWidth: 1.5,
        ...Platform.select({
            web: {
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                outlineStyle: "none", // 100% Sleek Web Focus!!!
            },
            default: {
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            }
        }),
        textAlignVertical: "top", // 100% Pro alignment for Android!!!
        zIndex: 1, // Ensure input doesn't block micIcon touch
    },
    micIcon: {
        position: "absolute",
        right: 12,
        bottom: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        ...Platform.select({
            web: {
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                cursor: "pointer", // 100% Professional Web Interaction!!!
            },
            default: {
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            }
        }),
        zIndex: 2, // Must be ABOVE the input for 100% clicks!!!
    },
    submitBtn: {
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 15,
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
    submitText: {
        fontSize: 18,
        fontWeight: "600",
    },
    listeningIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginBottom: 8,
        marginTop: 5,
        paddingVertical: 4,
    },
    listeningText: {
        fontSize: 14,
        fontWeight: "600",
        fontStyle: "italic",
    },
    separatorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
        paddingHorizontal: 5,
    },
    separatorLine: {
        flex: 1,
        height: 1.5,
        opacity: 1.0, // 100% Solid Clarity!!!
    },
    separatorText: {
        marginHorizontal: 20,
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 0,
    },
});
