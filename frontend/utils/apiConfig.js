import { Platform } from "react-native";

/* apologies this is being all done, even though it 
wasn't explicity mentioned in the certain assessments (i.e. 
revised project proposal, and so on), but our group wanted 
to add all of these features, so that it can helpful for 
all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
"CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */

// 💥 MASSIVE FIX: We completely abandon Expo's toxic environment variable caching.
// This variable is now directly injected by our sync-ip.js script for 1,000,000% reliability.
const TUNNEL_URL = "https://e6825c3125d0f0.lhr.life";
const LOCAL_WEB = "http://127.0.0.1:5001/api";
const PROD_API = "https://moodmate-backend-gyef.onrender.com/api";

export const getApiUrl = () => {
  if (__DEV__) {
    // 🏆 1,000,000% STABILITY: Prioritize direct Localhost for Web browsers
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        console.log("📍 Web Mode: Using Direct Localhost API (Extreme Speed)");
        return LOCAL_WEB;
      }
    }

    // 📱 [Cloud-Bridge Mastery] for Android/iOS
    // If we have an active tunnel, use it for cross-network connectivity.
    const isCloud = TUNNEL_URL && (
      TUNNEL_URL.includes("pgy.io") || 
      TUNNEL_URL.includes("ngrok") || 
      TUNNEL_URL.includes("lhr.life") || 
      TUNNEL_URL.includes("localhost.run")
    );

    if (isCloud) {
      console.log("🌍 Cloud Mode: Using Global Tunnel:", TUNNEL_URL);
      return `${TUNNEL_URL}/api`;
    }

    // Fallback to whatever TUNNEL_URL is (even if it's a local IP)
    if (TUNNEL_URL) {
      console.log("🌐 Dev Mode: Using Current Bridge:", TUNNEL_URL);
      return `${TUNNEL_URL}/api`;
    }

    return LOCAL_WEB;
  }

  // Production Mode
  return PROD_API;
};

export const getApiUrlSync = () => getApiUrl();
