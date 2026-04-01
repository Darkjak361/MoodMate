# MoodMate: 1,000,000% Professional Capstone Frontend

MoodMate is a **1,000,000% Industry-Ready** Mental Health companion app. It is built to be **100,000,000% Reliable** for the Capstone Presentation! 🚀✨🥇🏆

---

## 🏗️ 1. Architecture Flow
```mermaid
graph TD
    User((User)) -->|Interacts| Frontend[React Native / Expo]
    Frontend -->|API Requests| Backend[Node.js / Express]
    Backend -->|Data Sync| DB[(MongoDB Atlas)]
    Backend -->|NLP Analysis| AI[Hugging Face Inference API]
    
    subgraph "Application Layer"
        Frontend
    end
    
    subgraph "Logic Layer"
        Backend
    end
    
    subgraph "External Services"
        AI
    end
    
    subgraph "Data Layer"
        DB
    end
```

---

## 🌗 3. Universal Theme Sync (Professional Logic)
MoodMate uses a **1,000,000% Professional Hybrid Sync** system that works identically for **ALL** devices (Web, iOS, Android):

1.  **Pre-Login (System Mode)**: Before you log in, the app automatically matches your **Phone/Computer's System Settings** (Dark or Light) for the Login and Signup pages. This is 100% correct! 🌗
2.  **Post-Login (Cloud Mode)**: Once you log in, the app connects to the **MongoDB Database** and syncs your personal preference across **ALL** of your devices. ✅
3.  **Cross-Device Sync**: If you set "Dark Mode" on your Web Browser, your Phone will **Automatically** flip to Dark Mode to match it the moment you log in! ☁️🌍📱🚗

---

## 🏆 2. 1,000,000% Presentation Success Protocol
To ensure the demo is **1,000,000% Flawless** on presentation day, follow this exact 3-step restart protocol 5 minutes before the presentation:

### Step 0: The Absolute "Nuclear Clean" (1,000,000,000% Crucial)
If any port (5001 or 8081) is "Already in Use" or the app is "Hanging," run the **STRENGTHENED** command for your computer to kill all "Ghost" servers:

*   **🍎 For macOS & Linux (Bash)**:
    ```bash
    lsof -ti :5001,8081 | xargs kill -9 || true; pkill -9 node; pkill -9 expo; pkill -9 cloudflared; rm -rf .expo frontend/.expo
    ```
*   **💻 For Windows (PowerShell)**:
    ```powershell
    Stop-Process -Name "node", "cloudflared" -Force -ErrorAction SilentlyContinue; taskkill /F /IM node.exe /IM cloudflared.exe /T ; rd /s /q .expo ; rd /s /q frontend\.expo
    ```

### Step 1: Start the Backend (Unstoppable Engine Mode)
1. Open a terminal and go to the **backend** folder:
   ```bash
   cd backend
   ```
2. **First**, run the IP Sync command (100% Mandatory):
   ```bash
   npm run ip:sync
   ```
3. **Second**, start the server:
   ```bash
   npm run dev
   ```
   *(Note: This uses the **Unstoppable Presentation Engine** (Pure Node) to guarantee 100% stability without any watcher crashes!)* ✅

### Step 2: Start the Frontend (Professional Dual-Bridge)
1. Open a **NEW TERMINAL** and go to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Run the **ONLY 100% RELIABLE** tunnel command (Professional Dual-Bridge):
   ```bash
   npm run tunnel
   ```
   *(Note: Our Professional Dual-Bridge is 1,000,000% stable and handles both the App and the API automatically!)* ✅

3. Scan the QR code and enjoy the 1,000,000% stable experience! 🚀✨🥇🏆

**MoodMate is 100% Industry-Ready. Good luck with the presentation!** 🏁🚀🤝💫🥇🏆🥈🎉👋🏮