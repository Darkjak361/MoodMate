const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

console.log('🌐 Starting MoodMate Campus Victory Bridge (Tunneling Mode)...');

function checkBackendReady() {
    process.stdout.write('\r🔍 Waiting for Backend on port 5001...');
    const client = new net.Socket();
    client.connect(5001, '127.0.0.1', () => {
        console.log('\n✅ Backend is LIVE! Starting Expo Tunnel...');
        client.destroy();
        startExpoApp();
    });
    client.on('error', () => {
        client.destroy();
        setTimeout(checkBackendReady, 2000);
    });
}

async function startExpoApp() {
    console.log('\n🚀 [Industrial Shield] Clearing ports and launching tunnel...');
    spawn('npx', ['kill-port', '8081', '4040'], { shell: true }).on('close', () => {
        const expo = spawn('npx', ['expo', 'start', '--clear', '--tunnel'], {
            stdio: 'inherit',
            shell: true
        });

        process.on('SIGINT', () => { expo.kill(); process.exit(); });
    });
}

checkBackendReady();
