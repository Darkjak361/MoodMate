# MoodMate Project Documentation Final

**Course Code:** CPAN-324-0NA (Project Development II)  
**Program Name:** Computer Programming and Analysis (CP311)  
**Group Members:** Ekroop Hundal-Vatcher (N01632322), Suleman Ibrahim (N01370789)  
**Institution:** Humber College, North Campus, 205 Humber College Blvd, Etobicoke, Ontario M9W 5L7  
**Semester:** Winter 2026 (Semester 6), January 2026 To April 2026  
**Professor:** Arman Hamzehlou Kahrizi  
**Document Type:** MoodMate Project Documentation Final

---

## 1. Finalized Prototype Overview

The MoodMate prototype is a fully functional cross-platform wellness tool. Users can:
- **Analyze Mood:** Select an emoji or type thoughts for automatic insight generation.
- **Mood Insights:** View AI-generated reflections based on mood data.
- **History:** Review a complete history of all logged moods.
- **Statistics:** View 14-day mood trend graphs and statistical summaries.
- **Profile Management:** Manage user profiles and enable mobile-only reminders.
- **Data Privacy:** Delete account and all stored data at any time.

The prototype delivers a smooth experience across mobile (Expo Go) and web.

---

## 2. Installation Guide

### All Backend Installation Steps
1. Navigate to the backend directory:
   ```bash 
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure `.env` contains the required variables (do not modify if already present):
   - `MONGO_URI`
   - `HF_API_KEY`
4. Start the backend:
   ```bash
   npm start
   ```
5. **Tunnel Setup (Required for Mobile/Expo Go):**
   Open a new terminal in the `backend` directory and run:
   - **macOS:** `./start-tunnel-permanent.sh`
   - **Windows:** `start-tunnel-permanent.bat` or `.\start-tunnel-permanent.bat`

### All Frontend Installation Steps
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Expo in tunnel mode:
   ```bash
   npx expo start --tunnel
   ```
4. **Accessing the Application:**
   - **Web:** Press `w` in the terminal or open [http://localhost:8081](http://localhost:8081).
   - **iOS:** Scan the terminal QR code with your Camera app to open in **Expo Go**.
   - **Android:** Open the **Expo Go** app, select "Scan QR Code", and scan the terminal QR code.

---

## 3. Project Overview

MoodMate aims to help users reflect on emotional states, recognize patterns, and build healthier habits. It is designed for students and adults seeking simple daily emotional tracking and behavioral reflection.

---

## 4. Environment Setup Guide

### Required Versions & Tools
- **Node.js:** v18 or later
- **npm:** Included with Node.js
- **MongoDB:** Connection string (in `backend/.env`)
- **HuggingFace:** API Key (in `backend/.env`)
- **Expo CLI:** `npm install -g expo-cli`
- **Expo Go App:** Installed on iOS or Android device
- **IDE:** Visual Studio Code or similar
- **Browser:** Chrome, Edge, Firefox, or Safari

---

## 5. Libraries and Tools Used

### Backend
- **Express:** Web framework
- **Mongoose:** MongoDB object modeling
- **Cors:** Cross-Origin Resource Sharing
- **Dotenv:** Environment variable management
- **Axios / Node-Fetch:** HTTP requests
- **Bcryptjs / Jsonwebtoken:** Authentication and security

### Frontend
- **React / React-Native:** UI framework
- **Expo / Expo-Router:** Development platform and navigation
- **Expo-Notifications:** Mobile reminders
- **Gifted-Charts / React-Native-SVG:** Data visualization
- **Axios:** API communication

*Full version details can be viewed by running `npm list` in each directory.*

---

## 6. Undelivered Features
- All planned Phase 1 and Phase 2 features were successfully delivered.
- No features were removed or postponed.

---

## 7. Future Maintenance & SDK Upgrades

To keep MoodMate updated with the latest Expo SDK versions (e.g., SDK 57, 58 and beyond), follow these steps:

### Upgrading Expo SDK
1. **Upgrade Expo Package:**
   ```bash
   npm install expo@latest
   ```
2. **Upgrade Dependencies:**
   ```bash
   npx expo install --fix
   npx expo-doctor
   ```
3. **Update Native Projects:**
   If using Continuous Native Generation (development builds), clean and regenerate:
   ```bash
   npx expo prebuild --clean
   ```

### Switching to Development Builds
If you need features not supported by Expo Go or want to ship to app stores:
1. **Install Dev Client:** `npx expo install expo-dev-client`
2. **Build Native App locally:**
   - **Android:** `npx expo run:android`
   - **iOS:** `npx expo run:ios`
3. **Start Bundler:** `npx expo start` ( Metro will detect `expo-dev-client`)
4. **Maintenance Fix:** If you see a warning about `baseline-browser-mapping` being outdated, try running: `npm i baseline-browser-mapping@latest -D` in the `frontend` folder.
---

---

## 8. Proactive Group Enhancements (Stakeholder Transparency)

The following features were added proactively by our group to ensure the best possible user experience, even though they were not explicitly required in the initial project proposal or assessments. We believe these additions make MoodMate a truly professional and helpful tool for all users at all times.

> [!NOTE]  
> "Apologies this is being all done, even though it wasn't explicitly mentioned in the certain assessments (i.e. revised project proposal, and so on), but our group wanted to add all of these features, so that it can helpful for all of the users anytime, and all the time, as well. ALL 100%!!!"

### Specific Features Added:
- **Login Page (`login.js`):** Just added the **"Forgot Credentials"** section and a **100% Professional "Confirm Password" field** to your Sign Up page! Now, the app will 100% matching-check both fields during registration to prevent any typos. This is the highest industry standard! 🔐 100%!!!
- **Dashboard (`index.js`):** Standardized **header title sizes and greeting font sizes** for a calmer aesthetic, ALL 100%!!!
- **History Screen (`history.js`):** Wrapped the empty state in a **clean white card container** (matching Trends consistency), ALL 100%!!!
- **Trends Screen (`trends.js`):** Fixed the **double "No data" message bug** and standardized the header layout for 100% visual alignment, ALL 100%!!!
- **Profile Screen (`profile.js`):** Simplified **notification confirmation points** and added a clear **Delete Account button** for data sovereignty, ALL 100%!!!
- **Logout Component (`LogoutButton.js`):** Created a **centralized cross-platform component** for a consistent and reliable logout experience, ALL 100%!!!

---

## 9. Troubleshooting & Service Control

To ensure a 100% smooth experience for anyone running MoodMate (including for Assessment purposes), please follow these instructions:

### Handling Connection "Glitch" Errors
If you see an error like `CommandError: TypeError: Cannot read properties of undefined (reading 'body')` when starting the frontend tunnel:
1.  **Do not panic!** This is a temporary connection glitch with the tunnel provider (ngrok/Expo).
2.  Press **`Control + C`** in that terminal to stop the process.
3.  Run the start command again: `npx expo start --tunnel`.
4.  **If it still fails with the same error**, run this "Deep Fix" command to 100% refresh the tunnel tool: 
    - `npm install @expo/ngrok@latest --save-dev`
5.  It will connect perfectly after that 100% of the time!
6.  **Advanced Infallibility Fix (macOS / Linux)**: If you need to deeply reset EVERYTHING at once, run this "Universal Kill Switch":
    - `pkill -f expo && pkill -f ngrok && pkill -f node && lsof -ti :8081,5001 | xargs kill -9`
7.  **Advanced Infallibility Fix (Windows)**: If you need to deeply reset EVERYTHING at once, open **Command Prompt (Admin)** and run:
    - `taskkill /F /IM node.exe /T & taskkill /F /IM ngrok.exe /T`
8.  **Compatibility Fix (All Platforms)**: If dependencies are mismatched after an update, run:
    - `npx expo install --fix`
    - Then start with a clear cache: `npx expo start --tunnel --clear`

### Handling "Port Already In Use" Errors
If you see an error like `Port 5001 is running this app in another window` or `Port 8081 is already in use`:

#### On macOS / Linux:
1.  **Identify the Process ID (PID)**:
    - For **Backend** (Port 5001): Run `lsof -i :5001`
    - For **Frontend** (Port 8081): Run `lsof -i :8081`
2.  **Kill the Process**:
    - Look for the `PID` number in the output and run: `kill -9 <PID>`
    - *Example:* If the PID is 15777, run `kill -9 15777`.
3.  **Universal "Kill All" One-Liner (macOS/Linux)**: 
    - `pkill -f expo && pkill -f ngrok && pkill -f node && lsof -ti :8081,5001 | xargs kill -9`

#### On Windows:
1.  **Identify the Process ID (PID)**:
    - For **Backend** (Port 5001): Run `netstat -ano | findstr :5001`
    - For **Frontend** (Port 8081): Run `netstat -ano | findstr :8081`
2.  **Kill the Process**:
    - Look for the `PID` (the last number in the row) and run: `taskkill /F /PID <PID>`
3.  **Universal "Kill All" One-Liner (Windows Command Prompt)**:
    - `taskkill /F /IM node.exe /T & taskkill /F /IM ngrok.exe /T`
    - *Example:* If the PID is 15777, run `taskkill /F /PID 15777`.

3.  **Start Fresh**: Now you can run the start commands again and they will work 100% perfectly!

### Handling "Hanging Background Processes"
If the project still fails even after closing your terminal windows, it means a hidden process is "stuck" in the background:
1.  **Search for Stuck Processes**:
    - Run: `ps aux | grep -E "node|ngrok|expo"`
2.  **Identify the PID**:
    - Look for any lines mentioning `ngrok` or `node server.js`. The **PID** is the first number on that line.
    - *Example Sample:* If you see `ekroop 15912 ... ngrok`, the PID is `15912`.
3.  **Kill the Stuck PID**:
    - Run: `kill -9 <PID>` (e.g., `kill -9 15912`)
4.  **Try Again**: Run the start commands again and they will work 100% perfectly!

### How to STOP All Services "Forever"
Once you are finished testing the project and want to stop all background processes:
1.  Go to each open terminal window (Backend, Tunnel, and Frontend).
2.  Press **`Control + C`** on your keyboard in each window.
3.  This safely kills all servers and tunnels so they are no longer running on your system. 100%!!!

---

### Final Note on Tunneling Outages
If you have run all of the fix commands above and the tunnel is still showing a "TypeError" or "Connection Error", please **be 100% patient**. Sometimes the tunneling provider (Cloudflare/ngrok) experiences a temporary outage. If this happens, wait for a few moments and try again—it will usually fix itself and be running again as soon as possible! 100%!!!

---