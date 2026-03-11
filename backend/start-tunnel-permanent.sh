#!/bin/bash
# apologies this is being all done, even though it 
# wasn't explicity mentioned in the certain assessments (i.e. 
# revised project proposal, and so on), but our group wanted 
# to add all of these features, so that it can helpful for 
# all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
# "CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!!

cd "$(dirname "$0")"

if ! command -v cloudflared >/dev/null 2>&1; then
    echo "📦 cloudflared not found. Installing automatically..."
    echo ""
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command -v brew >/dev/null 2>&1; then
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
        brew install cloudflare/cloudflare/cloudflared
    else
        sudo apt-get update
        sudo apt-get install -y cloudflared
    fi
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install cloudflared. Please install manually."
        exit 1
    fi
    echo "✅ cloudflared installed successfully!"
    echo ""
fi

echo "🔍 Checking cloudflared version..."
cloudflared --version
echo ""

echo "🚀 Starting tunnel..."
node start-tunnel-permanent.js
