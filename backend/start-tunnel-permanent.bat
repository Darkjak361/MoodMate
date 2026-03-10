@echo off
cd /d "%~dp0"

where cloudflared >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 📦 cloudflared not found. Installing automatically...
    echo.
    where winget >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo ❌ winget not found. Please install cloudflared manually:
        echo    Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
        exit /b 1
    )
    winget install --id Cloudflare.cloudflared --silent
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to install cloudflared. Please install manually.
        exit /b 1
    )
    echo ✅ cloudflared installed successfully!
    echo.
)

echo 🔍 Checking cloudflared version...
cloudflared --version
echo.

echo 🚀 Starting tunnel...
node start-tunnel-permanent.js
