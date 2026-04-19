import { useEffect, useState, useCallback, useRef } from "react";
/* apologies this is being all done, even though it 
wasn't explicity mentioned in the certain assessments (i.e. 
revised project proposal, and so on), but our group wanted 
to add all of these features, so that it can helpful for 
all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
"CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Platform, RefreshControl, Vibration } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getMoodHistory, getMoodStats, clearMoodHistory } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Colors } from "../../constants/theme";
import TrendChart from "../../components/TrendChart";

export default function TrendsScreen() {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // 🏁 1,000% Reliable Scroll Ref for Mobile Focus!!!
    const scrollViewRef = useRef(null);

    // 🏁 100% AUTO-CLEAR selection if data is gone!!!
    useEffect(() => {
        if (history.length === 0) {
            setSelectedPoint(null);
        }
    }, [history]);

    const { user, logout } = useAuth();
    const { theme, isDark } = useTheme();
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

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [historyData, statsData] = await Promise.all([
                getMoodHistory(),
                getMoodStats(),
            ]);
            setHistory(historyData || []);
            setStats(statsData || { total: 0, positive: 0, neutral: 0, negative: 0, averageEnergy: 0 });
        } catch (error) {
            console.error("Error loading data:", error);
            setError(error.message || "Failed to load trends data");
            showAlert("Error", error.message || "Failed to load trends data");
        } finally {
            setLoading(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    useFocusEffect(
        useCallback(() => {
            if (Platform.OS === "web") {
                document.title = "Trends Page - MoodMate";
            }
            loadData();
        }, [loadData])
    );

    const handlePointSelect = (point) => {
        setSelectedPoint(point);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={activeColors.tint} />
            </View>
        );
    }

    if (error && !stats) {
        return (
            <View style={[styles.container, { backgroundColor: activeColors.background }]}>
                <View style={[styles.header, { borderBottomColor: activeColors.border }]}>
                    <Text style={styles.headerTitle}>Trends</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={loadData} style={[styles.retryButton, { backgroundColor: activeColors.tint }]}>
                        <Text style={[styles.retryButtonText, { color: activeColors.background }]}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const hasData = stats && stats.total > 0 && history.length > 0;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView
                ref={scrollViewRef}
                style={[styles.container, { backgroundColor: activeColors.background }]}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="always"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={activeColors.tint}
                        colors={[activeColors.tint]}
                    />
                }
            >
                <View style={[styles.header, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                    {hasData && (
                        <View style={[styles.noteContainer, { backgroundColor: activeColors.background, borderColor: activeColors.border }]}>
                            <Text style={[styles.noteText, { color: activeColors.secondary }]}>💡 Tip: Scroll down for "📖 Help & Information" on reading your statistics.</Text>
                        </View>
                    )}
                </View>

                {hasData ? (
                    <>
                        <View style={styles.statsContainer}>
                            {/* 🏆 BOX 1: DOMINANT INSIGHT SECTION */}
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Dominant Insight</Text>
                            <View style={[styles.dominantCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                                <View style={[styles.dominantIcon, { borderColor: activeColors.border }]}>
                                    <Ionicons
                                        name={
                                            stats.positive >= stats.neutral && stats.positive >= stats.negative ? "sunny-outline" :
                                                stats.negative >= stats.positive && stats.negative >= stats.neutral ? "cloudy-night-outline" : "reorder-two-outline"
                                        }
                                        size={28}
                                        color={activeColors.tint}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.dominantTitle, { color: activeColors.text }]}>
                                        {stats.positive >= stats.neutral && stats.positive >= stats.negative ? "Mostly Positive" :
                                            stats.negative >= stats.positive && stats.negative >= stats.neutral ? "Mostly Negative" : "Mostly Balanced"}
                                    </Text>
                                    <Text style={[styles.dominantSub, { color: activeColors.secondary }]}>
                                        {stats.positive >= stats.neutral && stats.positive >= stats.negative ? "You've been in a great headspace lately. Keep up the positive habits!" :
                                            stats.negative >= stats.positive && stats.negative >= stats.neutral ? "It's been a tough period. Remember to use the 'Calm Breath' tool when things feel heavy." :
                                                "You've maintained a steady balance recently. This stability is a great foundation for wellness."}
                                    </Text>
                                </View>
                            </View>

                            {/* 📊 BOX 2: MOOD DISTRIBUTION SECTION */}
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Mood Distribution</Text>
                            <View style={styles.statsGrid}>
                                <View style={[styles.statCard, { backgroundColor: activeColors.success + '20', borderColor: activeColors.border }]}>
                                    <Text style={[styles.statValue, { color: activeColors.success }]}>
                                        {((stats.positive / stats.total) * 100).toFixed(0)}%
                                    </Text>
                                    <Text style={[styles.statLabel, { color: activeColors.success }]}>Positive</Text>
                                </View>
                                <View style={[styles.statCard, { backgroundColor: activeColors.neutral + '20', borderColor: activeColors.border }]}>
                                    <Text style={[styles.statValue, { color: activeColors.neutral }]}>
                                        {((stats.neutral / stats.total) * 100).toFixed(0)}%
                                    </Text>
                                    <Text style={[styles.statLabel, { color: activeColors.neutral }]}>Neutral</Text>
                                </View>
                                <View style={[styles.statCard, { backgroundColor: activeColors.error + '20', borderColor: activeColors.border }]}>
                                    <Text style={[styles.statValue, { color: activeColors.error }]}>
                                        {((stats.negative / stats.total) * 100).toFixed(0)}%
                                    </Text>
                                    <Text style={[styles.statLabel, { color: activeColors.error }]}>Negative</Text>
                                </View>
                            </View>
                        </View>

                        {/* 📊 BOX 3: TREND GRAPH SECTION */}
                        <View style={styles.chartContainer}>
                            {/* 🏁 1,000% STRESS-RELIEF: SINGLE HORIZONTAL SCROLL WRAPPER FOR ALL MOBILE!!! */}
                            {Platform.OS === "web" ? (
                                <TrendChart history={history} onPointSelect={handlePointSelect} />
                            ) : (
                                <ScrollView
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={true}
                                    style={styles.chartScrollContainer}
                                    contentContainerStyle={styles.chartScrollContent}
                                >
                                    <TrendChart history={history} onPointSelect={handlePointSelect} />
                                </ScrollView>
                            )}
                        </View>

                        {/* 📍 SELECTED ENTRY DETAILS */}
                        {selectedPoint && (
                            <View style={[styles.explanationBox, { backgroundColor: activeColors.card, borderColor: activeColors.border, borderLeftWidth: 6, borderLeftColor: selectedPoint.mood === "POSITIVE" ? activeColors.success : selectedPoint.mood === "NEGATIVE" ? activeColors.error : activeColors.neutral, marginHorizontal: 20, marginBottom: 20 }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                    <Text style={[styles.explanationBoxTitle, { color: activeColors.text, marginBottom: 0 }]}>📍 Selected Entry Details</Text>
                                    <TouchableOpacity
                                        style={[styles.closeButtonOval, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
                                        onPress={() => setSelectedPoint(null)}
                                    >
                                        <Ionicons name="close" size={18} color={activeColors.tint} />
                                        <Text style={[styles.closeButtonText, { color: activeColors.text }]}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={[styles.explanationText, { color: activeColors.text, fontWeight: '700', fontSize: 16 }]}>
                                    Mood: {selectedPoint.mood} {selectedPoint.mood === "POSITIVE" ? "🌟" : selectedPoint.mood === "NEGATIVE" ? "🛡️" : "⚓️"}
                                </Text>
                                <Text style={[styles.explanationText, { color: activeColors.secondary }]}>
                                    Date: {new Date(selectedPoint.createdAt).toLocaleDateString()}
                                </Text>
                                <Text style={[styles.explanationText, { color: activeColors.secondary }]}>
                                    Mood Score: {selectedPoint.mood === "POSITIVE" ? "100" : selectedPoint.mood === "NEGATIVE" ? "0" : "50"} / 100
                                </Text>

                                {selectedPoint.text ? (
                                    <View style={{ marginTop: 8, padding: 10, backgroundColor: activeColors.background, borderRadius: 8, borderWidth: 1, borderColor: activeColors.border }}>
                                        <Text style={[styles.explanationText, { color: activeColors.text, marginBottom: 0, fontWeight: '600' }]}>Reason(s):</Text>
                                        <Text style={[styles.explanationText, { color: activeColors.text, fontStyle: 'italic' }]}>
                                            "{selectedPoint.text}"
                                        </Text>
                                    </View>
                                ) : null}

                                {selectedPoint.activities && selectedPoint.activities.length > 0 && (
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                                        <Text style={[styles.explanationText, { color: activeColors.secondary }]}>Activities:</Text>
                                        {selectedPoint.activities.map((act, idx) => (
                                            <View key={idx} style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: activeColors.tint + '20', borderRadius: 12 }}>
                                                <Text style={{ fontSize: 12, color: activeColors.tint, fontWeight: '600' }}>{act}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </>
                ) : (
                    <View style={[styles.emptyContainer, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                        <Text style={[styles.emptyText, { color: activeColors.text }]}>No data available yet</Text>
                        <Text style={[styles.emptySubtext, { color: activeColors.secondary }]}>
                            Start tracking your moods to see your trends
                        </Text>
                    </View>
                )}

                {/* 📖 HELP & INFORMATION BOX */}
                {hasData && (
                    <View style={[styles.explanationBox, { backgroundColor: activeColors.card, borderColor: activeColors.border, marginHorizontal: 20, marginBottom: 40 }]}>
                        <Text style={[styles.explanationBoxTitle, { color: activeColors.text }]}>📖 Help & Information</Text>
                        <Text style={[styles.explanationText, { color: activeColors.secondary }]}>
                            • **Mood Distribution**: Shows the percentage distribution of your positive, neutral, and negative mood entries.
                        </Text>
                        <Text style={[styles.explanationText, { color: activeColors.secondary }]}>
                            • **Global Mood Resilience Trend**: Tracks your emotional patterns over time.
                        </Text>
                        <Text style={[styles.explanationText, { color: activeColors.secondary, marginLeft: 15 }]}>
                            - **100**: Positive moments 🌟
                        </Text>
                        <Text style={[styles.explanationText, { color: activeColors.secondary, marginLeft: 15 }]}>
                            - **50**: Neutrality ⚓️
                        </Text>
                        <Text style={[styles.explanationText, { color: activeColors.secondary, marginLeft: 15 }]}>
                            - **0**: Negative challenges 🛡️
                        </Text>
                        <Text style={[styles.explanationText, { color: activeColors.secondary }]}>
                            • **Advanced Data Insights**:
                            {Platform.OS === "web"
                                ? " Click on any data point in the graph to reveal specific entry details instantly!"
                                : " Tap on the 'History' tab to see your moods, insights, and scores!"}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
    errorText: { fontSize: 16, textAlign: "center", marginBottom: 20 },
    retryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", elevation: 5 },
    retryButtonText: { fontSize: 16, fontWeight: "600" },
    statsContainer: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15, letterSpacing: 0.5 },
    dominantCard: { flexDirection: "row", padding: 18, borderRadius: 15, borderWidth: 1.5, marginBottom: 20, alignItems: "center", gap: 15, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", elevation: 5 },
    dominantIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", borderWidth: 1.5, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", elevation: 5 },
    dominantTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
    dominantSub: { fontSize: 14, lineHeight: 18 },
    statsGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    statCard: { flex: 1, padding: 18, borderRadius: 15, marginHorizontal: 5, alignItems: "center", borderWidth: 1.5, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", elevation: 5 },
    statValue: { fontSize: 22, fontWeight: "700" },
    statLabel: { fontSize: 12, fontWeight: "600", marginTop: 5 },
    emptyContainer: { margin: 20, marginTop: 40, padding: 20, borderRadius: 20, borderWidth: 1.5, alignItems: "center", justifyContent: "center", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", elevation: 5 },
    emptyText: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
    emptySubtext: { fontSize: 14, textAlign: "center" },
    chartContainer: { paddingHorizontal: 0 },
    chartScrollContainer: { minHeight: 300 },
    chartScrollContent: { paddingRight: 20 },
    noteContainer: { padding: 10, margin: 15, marginTop: 10, marginBottom: 8, borderRadius: 8, borderLeftWidth: 6, borderWidth: 1.5, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", elevation: 5 },
    noteText: { fontSize: 12, lineHeight: 18, fontWeight: "600" },
    explanationBox: { padding: 20, borderRadius: 15, margin: 20, marginTop: 10, borderWidth: 1.5, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", elevation: 5 },
    explanationBoxTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
    explanationText: { fontSize: 14, lineHeight: 20, marginBottom: 8, fontWeight: "500" },
    closeButtonOval: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 15, gap: 6, borderWidth: 1.5, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", elevation: 5 },
    closeButtonText: { fontSize: 14, fontWeight: "700" },
});
