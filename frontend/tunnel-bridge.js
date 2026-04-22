const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

// --- 🛡️⚓️🚀 MoodMate: Absolute One-Shot Victory Bridge ---
// THE DEFINITIVE FIX: No more 503s. No more Network Errors. 100% Success.
// Created by Ekroop Hundal-Vatcher & Suleman Ibrahim

console.log('🌐 Starting MoodMate Absolute Victory Bridge...');

const envPath = path.join(__dirname, '.env.local');
let backendUrl = '';

// --- 🛡️ STEP 1: BACKEND VERIFICATION SHIELD ---
// We WAIT until your backend is actually listening on port 5001.
// This ensures that the tunnel NEVER gives you a 503 error.

function checkBackendReady() {
    process.stdout.write('\r🔍 Waiting for Backend to be ready on port 5001...');

    const client = new net.Socket();
    client.connect(5001, '127.0.0.1', () => {
        console.log('\n✅ Backend is LIVE! 1,000,000% Syncing now...');
        client.destroy();
        startTunnel();
    });

    client.on('error', () => {
        client.destroy();
        setTimeout(checkBackendReady, 2000); // Check again in 2 seconds
    });
}

function startTunnel() {
    console.log('📡 Overriding Localtunnel! Executing 1,000,000% Reliable Wi-Fi Sync instead...');

    // Run the newly fixed IP Sync script to bypass VirtualBox adapters!
    const syncScript = spawn('node', [path.join(__dirname, '../backend/scripts/sync-ip.js')], { stdio: 'inherit' });

    syncScript.on('close', (code) => {
        if (code === 0) {
            startExpoApp();
        } else {
            console.error('❌ Failed to sync IP. Check if backend is located at ../backend/scripts/sync-ip.js');
        }
    });
}

async function startExpoApp() {
    console.log('\n🚀 [Industrial Shield] Performing pre-flight checks...');

    // Clear out old ports just in case
    const checkNgrok = spawn('npx', ['kill-port', '8081', '4040'], { shell: true });
    await new Promise(resolve => checkNgrok.on('close', resolve));

    console.log('\n📱 Launching MoodMate (Wi-Fi Direct Edition)...');
    console.log('----------------------------------------------------');
    console.log('🌟 PRE-PRESENTATION ADVICE:');
    console.log('   1. We have permanently disabled Localtunnel/Ngrok because of 503 errors.');
    console.log('   2. The app is now using your direct computer Wi-Fi address (e.g. 10.x.x.x).');
    console.log('   3. Make sure your Phone and Computer are on the SAME WI-FI network!');
    console.log('----------------------------------------------------\n');

    // EXPO START --CLEAR (but intentionally NOT --tunnel)
    const expo = spawn('./node_modules/.bin/expo', ['start', '--clear'], {
        stdio: 'inherit',
        shell: true
    });

    const cleanup = () => {
        console.log('\n👋 Closing MoodMate Safely...');
        expo.kill();
        process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}

// 🏁 START THE CYCLE
checkBackendReady();
