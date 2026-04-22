import { Platform } from "react-native";

/* apologies this is being all done, even though it 
wasn't explicity mentioned in the certain assessments (i.e. 
revised project proposal, and so on), but our group wanted 
to add all of these features, so that it can helpful for 
all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
"CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */

// 💥 MASSIVE FIX: We completely abandon Expo's toxic environment variable caching.
// This variable is now directly injected by our sync-ip.js script for 1,000,000% reliability.
const TUNNEL_URL = "http://10.111.18.102:5001";
const LOCAL_WEB = "http://127.0.0.1:5001/api";
const PROD_API = "https://moodmate-backend-gyef.onrender.com/api";

export const getApiUrl = () => {
  if (__DEV__) {
    // Web browser: use localhost directly
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        console.log("📍 Web Mode: Using Direct Localhost API");
        return LOCAL_WEB;
      }
    }

    // Android/iOS: always use the stable Render production backend
    console.log("📱 Mobile Mode: Using Render Production Backend");
    return PROD_API;
  }

  // Production Mode
  return PROD_API;
};

export const getApiUrlSync = () => getApiUrl();
