import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert, Platform, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getMoodHistory, deleteMoodEntry } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Colors } from "../../constants/theme";
import MoodCard from "../../components/MoodCard";

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [activeMood, setActiveMood] = useState("All");
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const activeColors = Colors[theme];
    const router = useRouter();

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

    const loadHistory = useCallback(async (filters = {}) => {
        try {
            console.log("Loading mood history with filters:", filters);
            const data = await getMoodHistory(filters);
            console.log("History loaded successfully, entries:", data?.length || 0);
            setHistory(data || []);
        } catch (error) {
            console.error("Error loading history:", error);
            showAlert("Error", error.message || "Failed to load history");
        }
    }, []);

    const handleSearch = (text) => {
        setSearch(text);
        loadHistory({ search: text, mood: activeMood });
    };

    const handleMoodFilter = (mood) => {
        setActiveMood(mood);
        loadHistory({ search: search, mood: mood });
    };

    useFocusEffect(
        useCallback(() => {
            if (Platform.OS === "web") {
                document.title = "History Page - MoodMate";
            }
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            console.log("History page focused - loading history...");
            loadHistory({ search, mood: activeMood });
        }, [loadHistory, search, activeMood])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory({ search, mood: activeMood });
        setRefreshing(false);
    };

    const handleDelete = (id) => {
        console.log("handleDelete called with ID:", id);
        if (!id) {
            console.error("Invalid entry ID");
            showAlert("Error", "Invalid entry ID");
            return;
        }

        const confirmDelete = async () => {
            try {
                await deleteMoodEntry(id);
                await loadHistory({ search, mood: activeMood });
                showAlert("Success", "The mood entry has been deleted successfully.");
            } catch (error) {
                console.error("Delete error:", error);
                showAlert("Error", error.message || "Failed to delete entry. Please try again.");
            }
        };

        showAlert(
            "Delete Entry",
            "Are you sure you want to delete this mood entry? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: confirmDelete }
            ]
        );
    };

    const FilterChip = ({ mood, icon }) => (
        <TouchableOpacity
            style={[
                styles.chip,
                { backgroundColor: activeColors.card, borderColor: activeColors.border },
                activeMood === mood && { backgroundColor: activeColors.tint, borderColor: activeColors.tint }
            ]}
            onPress={() => handleMoodFilter(mood)}
        >
            {icon && <Ionicons name={icon} size={16} color={activeMood === mood ? activeColors.background : activeColors.secondary} />}
            <Text style={[styles.chipText, { color: activeMood === mood ? activeColors.background : activeColors.text }]}>{mood}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <View style={styles.filterSection}>
                <View style={[styles.searchContainer, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                    <Ionicons name="search" size={20} color={activeColors.secondary} />
                    <TextInput
                        style={[styles.searchInput, { color: activeColors.text }]}
                        placeholder="Search your entries..."
                        placeholderTextColor={activeColors.secondary}
                        value={search}
                        onChangeText={handleSearch}
                    />
                </View>
                <View style={styles.chipsRow}>
                    <FilterChip mood="All" />
                    <FilterChip mood="Positive" icon="sunny" />
                    <FilterChip mood="Neutral" icon="reorder-two" />
                    <FilterChip mood="Negative" icon="cloudy-night" />
                </View>
            </View>

            <FlatList
                data={history}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <MoodCard
                        entry={item}
                        onDelete={() => handleDelete(item._id)}
                    />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={activeColors.tint}
                        colors={[activeColors.tint]}
                    />
                }
                ListEmptyComponent={
                    <View style={[styles.emptyContainer, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                        <Text style={[styles.emptyText, { color: activeColors.text }]}>No matching entries</Text>
                        <Text style={[styles.emptySubtext, { color: activeColors.secondary }]}>
                            Either start tracking your moods to see your history, or try adjusting your filters or search terms
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterSection: {
        padding: 20,
        paddingBottom: 10,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        borderRadius: 12,
        borderWidth: 1.5,
        height: 50,
        marginBottom: 15,
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontWeight: "500",
    },
    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        gap: 6,
    },
    chipText: {
        fontSize: 14,
        fontWeight: "600",
    },
    header: {
        display: "none",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    emptyContainer: {
        margin: 20,
        marginTop: 40,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        elevation: 5,
        // 🏆 1,000% Native Shadow Support (iOS/Android)!!!
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: "center",
    },
});
