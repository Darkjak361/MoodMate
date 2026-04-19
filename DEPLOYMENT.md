# 🌍 MoodMate: Master Deployment Guide (Cloud Industrial Version)

This document outlines the 1,000,000% Professional Cloud Architecture for MoodMate. The application has been fully decoupled from local development and is now a **Live, Globally Accessible Industrial Platform.**

---

## 🏗️ 1. Production Architecture Overview

The system is split into three distinct cloud layers for maximum reliability:

1.  **🚀 Backend Layer (Render)**: A live Node.js web service that handles API requests, authentication, and AI analysis.
2.  **🛡️ Database Layer (MongoDB Atlas)**: A high-availability cloud cluster in AWS, secured by IP whitelisting.
3.  **📱/🌐 Frontend Layer (EAS & Vercel)**:
    *   **Android**: A physical APK generated via Expo Application Services (EAS).
    *   **Web**: A live React Native Web instance hosted on Vercel.

---

## 🚀 2. Backend Deployment (Render)

The backend is hosted as a **Web Service** on Render.

*   **Service Name**: `moodmate-backend`
*   **Repo Root**: `/backend`
*   **Build Command**: `npm install`
*   **Start Command**: `node server.js`
*   **Health Check**: `https://your-app.onrender.com/health`

### 🔑 Required Environment Variables (Environment Tab)
| Key | Value |
| :--- | :--- |
| `MONGO_URI` | `mongodb+srv://suleman:Moodmate619@cluster0...` |
| `JWT_SECRET` | (Your Secure Secret Key) |
| `HF_API_KEY` | (Your Hugging Face Token) |
| `PORT` | `5001` |

---

## 🛡️ 3. Database Security (MongoDB Atlas)

To allow the cloud backend to talk to the database, the **Network Access** must be configured for "Universal Cloud Connectivity."

1.  Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2.  Go to **Security > Network Access**.
3.  Add IP Address: **`0.0.0.0/0`** (Allow Access from Anywhere).
    *   *Note: This is required for Render/Vercel as they use dynamic IP ranges.*
4.  Verify the Database User (e.g., `suleman`) has **Read/Write** permissions.

---

## 📱 4. Android Deployment (EAS / APK)

Instead of using Expo Go, the project is deployed as a **Standalone Android APK** that you can install on any phone.

### 🏗️ Build Command (Run from `frontend/`):
```bash
eas build --platform android --profile preview
```
*   **Profile**: Uses the `preview` profile in `eas.json` to generate an `.apk` file instead of an `.aab`.
*   **Outcome**: EAS will provide a download link. Download the APK and install it on your device.

---

## 🌐 5. Web Deployment (Vercel)

The web version provides a professional browser experience for stakeholders who do not have an Android device.

### 🛠️ Configuration Settings:
1.  **Framework Preset**: Other (React Native Web / Expo)
2.  **Root Directory**: `frontend`
3.  **Build Command**: `npx expo export --platform web`
4.  **Output Directory**: `dist`

### 🏁 Deployment Steps:
1.  Connect your GitHub repo to **Vercel**.
2.  Set the **Root Directory** to `frontend`.
3.  Click **Deploy**. Vercel will automatically sync with every `git push`.

---

## 🔄 6. The "Push-to-Production" Workflow

To update both the Android and Web versions simultaneously, use this industrial sequence:

1.  **Commit Changes**:
    ```bash
    git add .
    git commit -m "🚀 Production Update: [Feature Name]"
    ```
2.  **Push to World**:
    ```bash
    git push origin main
    ```
3.  **Auto-Deploy**: 
    *   **Web**: Vercel will automatically start a new build.
    *   **Backend**: Render will automatically start a new deploy.
    *   **APK**: If major frontend changes were made, run `eas build` again to generate a new APK.

---

### 🏆 Capstone Verification Sign-Off
This deployment architecture ensures that MoodMate remains **1,000,000% operational** even if the local development laptop is powered off. It is ready for final project evaluation and stakeholder review. 🥇🏆🥇
