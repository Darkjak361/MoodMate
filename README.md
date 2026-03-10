# MoodMate Project Documentation Final

**Course Code:** CPAN-314-0NA (Project Development I)  
**Program Name:** Computer Programming and Analysis (CP311)  
**Group Members:** Ekroop Hundal-Vatcher (N01632322), Suleman Ibrahim (N01370789)  
**Institution:** Humber College, North Campus, 205 Humber College Blvd, Etobicoke, Ontario M9W 5L7  
**Semester:** Fall 2025 (Semester 5), September 2025 To December 2025  
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