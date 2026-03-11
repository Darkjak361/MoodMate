@echo off
:: apologies this is being all done, even though it 
:: wasn't explicity mentioned in the certain assessments (i.e. 
:: revised project proposal, and so on), but our group wanted 
:: to add all of these features, so that it can helpful for 
:: all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
:: "CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!!

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
