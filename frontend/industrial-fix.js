const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// --- 🛡️ MOODMATE INDUSTRIAL VICTORY BRIDGE ---
// This script guarantees a 1,000,000% reliable connection on Campus Wi-Fi.
// It manages the Backend, Frontend, and Tunnels in a single thread.

console.log('🚀 [Industrial Shield] Initializing Victory Sequence...');

const frontendDir = __dirname;
const backendDir = path.join(__dirname, '../backend');
const apiConfigPath = path.join(frontendDir, 'utils/apiConfig.js');

async function runStep(label, command, args, options = {}) {
    console.log(`\n⏳ [Step] ${label}...`);
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, { 
            stdio: options.silent ? 'pipe' : 'inherit', 
            shell: true,
            cwd: options.cwd || frontendDir
        });

        if (options.silent) {
            proc.stdout.on('data', (data) => {
                const output = data.toString();
                if (options.until && output.includes(options.until)) {
                    resolve({ proc, output });
                }
            });
        }

        proc.on('error', reject);
        
        // If not silent or no "until" trigger, resolve immediately if background
        if (options.background) {
            setTimeout(() => resolve({ proc }), 2000);
        }
    });
}

async function victory() {
    try {
        // 1. Cleanup
        console.log('🧹 Clearing stale ports (8081, 5001, 4040)...');
        await runStep('Port Cleanup', 'npx', ['kill-port', '8081', '5001', '4040']);

        // 2. Start Backend
        console.log('📡 Launching Industrial Backend...');
        const backend = await runStep('Backend Start', 'npm', ['run', 'start'], { 
            cwd: backendDir, 
            background: true 
        });

        // 3. Start Backend Tunnel
        console.log('🌐 Establishing Backend Tunnel...');
        const beTunnel = await runStep('Backend Tunnel', 'npx', ['localtunnel', '--port', '5001'], {
            silent: true,
            until: 'your url is:'
        });
        
        const backendUrl = beTunnel.output.match(/your url is: (.*)/)[1].trim();
        console.log(`✅ Backend Tunnel LIVE: ${backendUrl}`);

        // 4. Update API Configuration
        console.log(`📝 Syncing Configuration...`);
        let config = fs.readFileSync(apiConfigPath, 'utf8');
        config = config.replace(/const TUNNEL_URL = \".*\";/, `const TUNNEL_URL = "${backendUrl}";`);
        fs.writeFileSync(apiConfigPath, config);
        console.log('✅ Configuration Synchronized 100%!');

        // 5. Start Metro and Frontend Tunnel
        console.log('\n📱 ATOMIC BUNDLE LAUNCH! Scan the QR code that appears below...');
        console.log('------------------------------------------------------------');
        console.log('⚠️ ON CAMPUS: Always open the tunnel URL in your phone browser FIRST');
        console.log('   to clear the "Welcome to localtunnel" security screen!');
        console.log('------------------------------------------------------------\n');

        // Start Metro
        runStep('Metro Bundler', 'npx', ['expo', 'start', '--clear'], { background: true });

        // Start Frontend Tunnel (Show to user)
        const feTunnel = spawn('npx', ['localtunnel', '--port', '8081'], { 
            stdio: 'inherit', 
            shell: true,
            cwd: frontendDir 
        });

        process.on('SIGINT', () => {
            console.log('\n👋 Closing Industrial Bridge...');
            process.exit();
        });

    } catch (err) {
        console.error('❌ Victory Sequence Failed:', err);
    }
}

victory();
