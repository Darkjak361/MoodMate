# 🌍 MoodMate: 1,000,000% Master Deployment Guide

This document contains **EVERYTHING** necessary for the professional deployment of MoodMate across Android, iOS, and Web platforms, following the exact standards for Capstone project submission.

---

## 🏗️ 1. Prerequisites & Installation

Before building for any platform, ensure your environment is set up correctly.

### 🔧 Install Expo Application Services (EAS) CLI
EAS is used to build the standalone app in the cloud.
*   **MacOS**: `sudo npm install -g eas-cli`
*   **Windows**: `npm install -g eas-cli` (Run in CMD as Administrator)

### ☕ Install Java Development Kit (JDK)
Necessary for generating Android signing keys (`keytool`).
*   Download JDK 11 or higher from [Oracle](https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html).
*   **MacOS**: Keytool is usually located at `/usr/libexec/java_home`.
*   **Windows**: Keytool is found in `C:\Program Files\Java\jdkx.x.x_x\bin`.

---

## 🤖 2. Android Deployment (Standalone APK)

### 🔑 Step 1: Generate a Signing Key (Keystore)
To distribute your app, you need a signed APK file. Keep this file safe!

**Run this command inside the `frontend/` directory:**
```bash
# MacOS
sudo keytool -genkey -v -keystore moodmate-upload-key.keystore -alias moodmate-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Windows
keytool -genkeypair -v -storetype PKCS12 -keystore moodmate-upload-key.keystore -alias moodmate-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
*   **Important**: Answer all questions (Name, Org, City, etc.) accurately.
*   **Security**: Remember your password! If you lose the key, you cannot update the app.

### 🏗️ Step 2: Build the APK
Generate a file that can be manually installed on any Android device.
```bash
eas build -p android --profile MyDeploymentPreview
```
*   **Result**: EAS will provide a link to download the `.apk` file.

### 📤 Step 3: Publish to Google Play Store (Optional)
```bash
eas submit -p android
```

---

## 🍎 3. iOS Deployment (Simulator & Physical)

**Note**: Building for iOS requires an Apple Developer Account ($99/year).

### 🖥️ Step 1: Build for iOS Simulator
This generates a `.app` file that runs on Mac computers using the iOS Simulator.
```bash
eas build -p ios --profile MyDeploymentPreview
```
*   **Post-Build**: Download the `.tar.gz` file, extract it to get the `.app` file.
*   **Run**: Launch iOS Simulator and drag-and-drop the `.app` file onto it.

### 📱 Step 2: Build for Physical iOS Devices
```bash
eas build -p ios --profile production
```
*   Follow the prompts to register your device (UDID) and install the build.

### 📤 Step 3: Submission to Apple App Store
```bash
eas submit -p ios
```

---

## 🌐 4. Web Deployment (Apple & Universal Web)

The web version is **100% optimized** for all devices, including iPhones, iPads, and Android browsers.

### 🚀 Deploy to Render (Industrial Hosting)
1.  **Build Command**: `npx expo export` (Exports all platforms including web)
2.  **Publish Directory**: `frontend/dist`
3.  **Hosting**: Connect GitHub to **Render** as a "Static Site".
4.  **Compatibility**: This version works perfectly as an "Apple Web Version" via Safari on iOS.

---

## 🛡️ 5. Backend & Database (Production Config)

### 🚀 Backend (Render Web Service)
*   **Repo Root**: `/backend`
*   **Build Command**: `npm install`
*   **Start Command**: `node server.js`
*   **Required Env Vars**: `MONGO_URI`, `JWT_SECRET`, `HF_API_KEY`, `PORT=5001`.

### 🍃 Database (MongoDB Atlas)
*   **Network Access**: Must set to `0.0.0.0/0` in Atlas to allow Render servers to connect.

---

## 🏆 6. Final Capstone Submission Checklist
- [x] Backend is LIVE on Render.
- [x] Database is whitelisted for Cloud Access.
- [x] Android APK is generated via `MyDeploymentPreview`.
- [x] iOS Simulator build is ready for Mac presentation.
- [x] Web Version is LIVE and accessible on Safari/Chrome.

---

## ⚡ 7. Industrial Shortcut Scripts
To make building even faster, you can run these commands from the **root directory**:

*   **Build Android APK**: `npm run build:apk`
*   **Build iOS Simulator**: `npm run build:ios`
*   **Export Web Version**: `npm run build:web`

---

**MoodMate is now 100,000,000% Production Ready!** 🚀🏆🥇
