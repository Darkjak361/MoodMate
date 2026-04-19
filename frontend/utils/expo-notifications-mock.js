// 🛡️⚓️🚀 MoodMate: Industrial expo-notifications mock for SSR
// Ensures that static bundling doesn't crash on browser-only globals.

export const getRegistrationInfoAsync = async () => null;
export const getExpoPushTokenAsync = async () => ({ data: 'MOCK_TOKEN' });
export const setNotificationChannelAsync = async () => null;
export const setNotificationHandler = () => {};
export const addNotificationReceivedListener = () => ({ remove: () => {} });
export const addNotificationResponseReceivedListener = () => ({ remove: () => {} });
export const scheduleNotificationAsync = async () => 'MOCK_ID';
export const cancelAllScheduledNotificationsAsync = async () => {};
export const cancelScheduledNotificationAsync = async () => {};
export const getAllScheduledNotificationsAsync = async () => [];
export const dismissAllNotificationsAsync = async () => {};
export const dismissNotificationAsync = async () => {};
export const setBadgeCountAsync = async () => {};
export const getBadgeCountAsync = async () => 0;

export default {
    getRegistrationInfoAsync,
    getExpoPushTokenAsync,
    getDevicePushTokenAsync: async () => ({ data: 'MOCK_TOKEN' }),
    setNotificationChannelAsync,
    setNotificationHandler,
    addNotificationReceivedListener,
    addNotificationResponseReceivedListener,
    scheduleNotificationAsync,
    cancelAllScheduledNotificationsAsync,
    cancelScheduledNotificationAsync,
    getAllScheduledNotificationsAsync,
    dismissAllNotificationsAsync,
    dismissNotificationAsync,
    setBadgeCountAsync,
    getBadgeCountAsync,
    requestPermissionsAsync: async () => ({ status: 'granted' }),
    getPermissionsAsync: async () => ({ status: 'granted' }),
};
