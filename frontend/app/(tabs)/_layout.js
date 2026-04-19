import { Tabs } from "expo-router";
/* apologies this is being all done, even though it 
wasn't explicity mentioned in the certain assessments (i.e. 
revised project proposal, and so on), but our group wanted 
to add all of these features, so that it can helpful for 
all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
"CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */
import { Ionicons } from "@expo/vector-icons";
import LogoutButton from "../../components/LogoutButton";

import { useTheme } from "../../contexts/ThemeContext";
import { Colors } from "../../constants/theme";

export default function TabLayout() {
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: activeColors.tint,
                tabBarInactiveTintColor: activeColors.tabIconDefault,
                tabBarStyle: {
                    backgroundColor: activeColors.card,
                    borderTopWidth: 1.5,
                    borderTopColor: activeColors.border,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                headerStyle: {
                    backgroundColor: activeColors.tint,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: activeColors.background,
                headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 20,
                },
                headerRight: () => <LogoutButton />,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Analyze Mood",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="analytics" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="time" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="trends"
                options={{
                    title: "Trends",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="trending-up" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
