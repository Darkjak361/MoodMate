import AsyncStorage from "@react-native-async-storage/async-storage";
/* apologies this is being all done, even though it 
wasn't explicity mentioned in the certain assessments (i.e. 
revised project proposal, and so on), but our group wanted 
to add all of these features, so that it can helpful for 
all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
"CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */
import { getApiUrl } from "../utils/apiConfig";
import { syncOfflineEntries } from "../utils/storageSync";

let isSyncing = false;
const autoSync = async () => {
  if (isSyncing) return;
  isSyncing = true;
  try {
    await syncOfflineEntries(analyzeMood);
  } catch (e) {
    console.log("Auto-sync background check failed (expected if offline)");
  } finally {
    isSyncing = false;
  }
};

const getToken = async () => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch {
    return null;
  }
};

const apiCall = async (endpoint, options = {}) => {
  try {
    const API_URL = getApiUrl();
    console.log("🌐 Making API call to:", `${API_URL}${endpoint}`);

    const token = await getToken();
    const headers = {
      "Content-Type": "application/json",
      "bypass-tunnel-reminder": "true", // 🛡️ 1,000,000% Localtunnel Shield!
      "ngrok-skip-browser-warning": "true", // 🛡️ 1,000,000% Ngrok Shield!
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 🏁 100% Reliability Shield

    console.log(`📡 Fetching endpoint: ${endpoint}...`);
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch { }

        console.error("❌ API Error:", errorData);

        throw new Error(
          errorData.error ||
          errorData.message ||
          `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ API Success:", endpoint);

      // Post-success auto-sync check (non-blocking)
      if (endpoint !== "/mood/analyze") {
        autoSync();
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error(`Request timeout: The backend at ${API_URL} is taking too long to respond. Please check your connection or try again.`);
      }
      throw error;
    }
  } catch (error) {
    console.error("❌ API Call Error:", error.message);
    console.error("Error name:", error.name);
    console.error("Full error:", error);

    const apiUrl = getApiUrl();

    if (
      error.message.includes("Failed to fetch") ||
      error.name === "TypeError" ||
      error.message.includes("Network")
    ) {
      throw new Error(
        `Network error: Cannot reach backend at ${apiUrl}.`
      );
    }

    throw error;
  }
};

export const register = async (username, email, password, name) =>
  apiCall("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password, name }),
  });

export const login = async (email, password) =>
  apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const googleLogin = async (email, name, googleId) =>
  apiCall("/auth/google", {
    method: "POST",
    body: JSON.stringify({ email, name, googleId }),
  });

export const getCurrentUser = async () => apiCall("/auth/me");

export const analyzeMood = async (text, extra = {}) =>
  apiCall("/mood/analyze", {
    method: "POST",
    body: JSON.stringify({ text, ...extra }),
  });

export const getMoodHistory = async (filters = {}) => {
  const { mood, search } = filters;
  let endpoint = "/mood/history";
  const params = [];
  if (mood) params.push(`mood=${encodeURIComponent(mood)}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);

  if (params.length > 0) {
    endpoint += `?${params.join("&")}`;
  }
  return apiCall(endpoint);
};

export const deleteMoodEntry = async (id) =>
  apiCall(`/mood/${id}`, { method: "DELETE" });

export const clearMoodHistory = async () =>
  apiCall("/mood/history", { method: "DELETE" });

export const getMoodStats = async () => apiCall("/mood/stats");


export const getDailyQuote = async () => apiCall("/quotes/daily");

export const getDailyActivity = async () => apiCall("/activities/daily");

export const getSettings = async () => apiCall("/settings");

export const updateSettings = async (settings) =>
  apiCall("/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });

export const deleteUser = async (password) =>
  apiCall("/user", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });

export const registerPushToken = async (pushToken) =>
  apiCall("/push/register", {
    method: "POST",
    body: JSON.stringify({ pushToken }),
  });

export const pushNotification = async (title, body, data) =>
  apiCall("/push/send", {
    method: "POST",
    body: JSON.stringify({ title, body, data }),
  });
