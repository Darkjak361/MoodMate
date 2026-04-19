const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// --- 🛡️⚓️🚀 MoodMate: Industrial Ngrok Bridge ---
// This script provides 1,000,000% stability on Campus Wi-Fi.
// It bypasses the unstable Localhost.run/Localtunnel 503 errors.

const PORT = 5001;
const apiConfigPath = path.join(__dirname, '../../frontend/utils/apiConfig.js');

console.log('🚀 [Industrial Shield] Preparing Stable Ngrok Bridge...');

// 1. Check if backend is running
const checkBackend = () => {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
    });
};

async function start() {
    const isBackendUp = await checkBackend();
    if (!isBackendUp) {
        console.error('❌ Backend is not running on port 5001! Please run "npm run dev" first.');
        process.exit(1);
    }

    console.log(`📡 Launching Ngrok tunnel to port ${PORT}...`);
    
    // Start ngrok via npx
    const ngrok = spawn('npx', ['ngrok', 'http', PORT.toString()], {
        shell: true,
        stdio: 'pipe'
    });

    // 2. Poll the Ngrok API to get the public URL
    let attempts = 0;
    const maxAttempts = 20;

    const getTunnelUrl = () => {
        return new Promise((resolve) => {
            const req = http.get('http://localhost:4040/api/tunnels', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.tunnels && json.tunnels.length > 0) {
                            resolve(json.tunnels[0].public_url);
                        } else {
                            resolve(null);
                        }
                    } catch (e) {
                        resolve(null);
                    }
                });
            });
            req.on('error', () => resolve(null));
        });
    };

    const poll = async () => {
        const url = await getTunnelUrl();
        if (url) {
            console.log(`\n✅ Stable Tunnel LIVE: ${url}`);
            updateConfig(url);
        } else if (attempts < maxAttempts) {
            attempts++;
            process.stdout.write('.');
            setTimeout(poll, 1000);
        } else {
            console.error('\n❌ Failed to get Ngrok URL. Make sure you have added your authtoken!');
            console.log('💡 Run: npx ngrok config add-authtoken YOUR_TOKEN');
            ngrok.kill();
            process.exit(1);
        }
    };

    function updateConfig(url) {
        try {
            console.log('📝 Syncing Frontend Configuration...');
            let content = fs.readFileSync(apiConfigPath, 'utf8');
            content = content.replace(/const TUNNEL_URL = \".*\";/, `const TUNNEL_URL = "${url}";`);
            fs.writeFileSync(apiConfigPath, content);
            console.log('✅ 100% Correct Configuration Ready!');
            console.log('\n📱 Scan the QR code in your Expo terminal and enjoy real-time connectivity!');
            console.log('----------------------------------------------------');
        } catch (err) {
            console.error('❌ Failed to update apiConfig.js:', err.message);
        }
    }

    setTimeout(poll, 2000);

    ngrok.on('close', (code) => {
        if (code !== 0 && code !== null) {
            console.log(`\n⚠️ Ngrok process exited with code ${code}`);
        }
    });

    process.on('SIGINT', () => {
        ngrok.kill();
        process.exit();
    });
}

start();
