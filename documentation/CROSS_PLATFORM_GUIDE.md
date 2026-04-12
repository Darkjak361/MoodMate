# MoodMate: Cross-Platform Operating Systems Guide 🌍🚀✨

This guide ensures that every developer and designer on the MoodMate team can run the project 100% successfully, regardless of whether they use **Windows, macOS, or Linux**.

---

## 🛠️ 1. Universal Maintenance Commands (Root)
We have standardized our scripts to use Node-based tools like `rimraf` and `kill-port` to avoid platform-specific errors.

| Command | Purpose | Why it's Universal |
| :--- | :--- | :--- |
| `npm run update:all` | Updates and installs all dependencies for root, backend, and frontend. | Uses `cd` and `&&` which are supported across all modern shells. |
| `npm run clean:all` | Deletes all `node_modules` folders and performs a fresh install. | Uses `rimraf`, the industry-standard cross-platform deletion tool. |
| `npm run install:all` | Installs dependencies for both backend and frontend. | Standard `npm` commands work on all OS. |
| `npm run ports:clear` | Kills any processes stuck on ports 5001 or 8081. | Uses `kill-port`, replacing the need for `lsof` (Mac) or `taskkill` (Windows). |

---

## 📱 2. Frontend Specific Fixes
If you encounter "Port already in use" or "Tunnel failed" errors on any OS:

*   **`npm run tunnel:fix`**:
    -   **Windows**: Automatically kills the stuck process and clears the `.expo` cache.
    -   **macOS/Linux**: Performs the same logic without needing native shell scripts.

---

## 💻 3. OS-Specific Logic (For Advanced Users)
While our `npm` scripts handle most cases, here are the underlying system commands for manual troubleshooting:

### 🍎 macOS / 🐧 Linux
- **Kill Port**: `lsof -ti :5001,8081 | xargs kill -9`
- **Delete Folder**: `rm -rf node_modules`
- **Search Process**: `ps aux | grep node`

### 💻 Windows (Command Prompt / PowerShell)
- **Kill Port**: `npx kill-port 5001 8081` (Recommended)
- **Delete Folder**: `rmdir /s /q node_modules`
- **Search Process**: `tasklist /fi "imagename eq node.exe"`

---

## ✅ 4. Summary for the Group
To keep the project stable for everyone:
1.  **Always use `npm run` commands** instead of raw shell commands.
2.  Maintain the `package.json` structures as they are 1,000% optimized for cross-platform harmony.
3.  If a script fails on your machine, let the team know so we can update the universal logic!

**MoodMate: Engineered for Every Developer. 100%.** 🏁🚀✨🥇🏆
