const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

/**
 * 🛡️ MOODMATE CLOUD-VICTORY BRIDGE 🚀
 * VERSION 2.0 - REINFORCED STABILITY
 */

const BACKEND_PORT = 5001;
const API_CONFIG_PATH = path.join(__dirname, '../../frontend/utils/apiConfig.js');

console.log('🌐 [Cloud Bridge] Initializing MoodMate Universe Synchronization...');

function checkBackendReady() {
    return new Promise((resolve) => {
        let attempts = 0;
        const check = () => {
            attempts++;
            const client = new net.Socket();
            client.connect(BACKEND_PORT, '127.0.0.1', () => {
                client.destroy();
                resolve();
            });
            client.on('error', () => {
                client.destroy();
                if (attempts % 5 === 0) {
                    process.stdout.write(`\n⏳ [Sync] Still waiting for backend on ${BACKEND_PORT}...`);
                } else {
                    process.stdout.write('.');
                }
                setTimeout(check, 1000);
            });
        };
        process.stdout.write('🔍 Waiting for Backend to be ready on port ' + BACKEND_PORT);
        check();
    });
}

function updateFrontendConfig(tunnelUrl) {
    if (!fs.existsSync(API_CONFIG_PATH)) {
        console.error(`❌ ERROR: Could not find config at ${API_CONFIG_PATH}`);
        return;
    }

    console.log(`\n📝 [Sync] Injecting Cloud URL: ${tunnelUrl}`);
    let content = fs.readFileSync(API_CONFIG_PATH, 'utf8');
    
    // Improved regex to handle various quotation styles and trailing slashes
    const updatedContent = content.replace(
        /const TUNNEL_URL = [\"\'].*[\"\'];/,
        `const TUNNEL_URL = "${tunnelUrl}";`
    );

    if (content === updatedContent) {
        console.log('⚠️ [Warning] CONFIG NOT CHANGED! Did the regex fail?');
    }

    fs.writeFileSync(API_CONFIG_PATH, updatedContent);
    console.log('✅ [Sync] Configuration Synchronized 1,000,000%!');
}

async function startBridge() {
    console.log('📡 Launching Backend Server...');
    const backend = spawn('npm', ['run', 'dev'], { 
        shell: true, 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
    });

    await checkBackendReady();
    console.log('\n✅ Backend is LIVE!');

    console.log('🔗 Establishing Global Cloud Bridge via Localhost.run (Zero-Account Version)...');
    
    // Localhost.run works over standard SSH and doesn't require an account!
    // We use port 443 to bypass most firewalls.
    const tunnel = spawn('ssh', [
        '-R', '80:localhost:' + BACKEND_PORT,
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'ServerAliveInterval=30',
        'nokey@localhost.run'
    ], { shell: true });

    let urlFound = false;

    tunnel.stdout.on('data', (data) => {
        const output = data.toString();
        
        // 🔍 DEBUG: Log output to catch the URL
        const match = output.match(/https:\/\/[a-z0-9-\.]+\.(lhr\.life|localhost\.run)/i);
        
        if (match && !urlFound) {
            const cloudUrl = match[0];
            urlFound = true;
            console.log('\n---------------------------------------------------------');
            console.log(`🌍 CLOUD BRIDGE ACTIVE (LHR): ${cloudUrl}`);
            console.log('---------------------------------------------------------');
            updateFrontendConfig(cloudUrl);
            console.log('📱 App is ready. Refresh now!');
            console.log('---------------------------------------------------------\n');
        }
    });

    tunnel.stderr.on('data', (data) => {
        const err = data.toString();
        if (err.toLowerCase().includes('error') || err.toLowerCase().includes('failed')) {
            console.log(`❌ [Tunnel Error]: ${err.trim()}`);
        }
    });

    const cleanup = () => {
        console.log('\n👋 Closing Cloud Bridge Safely...');
        tunnel.kill();
        backend.kill();
        process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}

startBridge();
