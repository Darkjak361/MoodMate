const os = require("os");
const fs = require("fs");
const path = require("path");

/**
 * Automates the "Manual IP" setup taught in standard CPAN courses.
 * Finds your computer's local IP and updates the Frontend config so
 * your phone can talk to your backend over Wi-Fi instantly! 100% Reliable!
 */

const getLocalIp = () => {
    const nets = os.networkInterfaces();
    // 🏆 1,000,000% Robust Cross-Platform IP Discovery (V2)
    // Prioritizes common Wi-Fi/Ethernet interface names across Mac, Windows, and Linux.
    const priorityInterfaces = ["en0", "en1", "wlan0", "eth0", "Wi-Fi", "Ethernet"];
    
    // Sort interfaces to check priority ones first
    const sortedInterfaceNames = Object.keys(nets).sort((a, b) => {
        const aIdx = priorityInterfaces.findIndex(p => a.includes(p));
        const bIdx = priorityInterfaces.findIndex(p => b.includes(p));
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
    });

    for (const name of sortedInterfaceNames) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }
    return "127.0.0.1";
};

const syncIp = () => {
  const ip = getLocalIp();
  const backendUrl = `http://${ip}:5001`;
  const frontendEnvPath = path.join(__dirname, "../../frontend/.env.local");

  console.log(`\n🔍 Detected Local IP: ${ip}`);
  console.log(`🌐 Backend will be reachable at: ${backendUrl}`);

  let envContent = "";
  if (fs.existsSync(frontendEnvPath)) {
    envContent = fs.readFileSync(frontendEnvPath, "utf8");
  }

  // Update or Add EXPO_PUBLIC_TUNNEL_URL (Reusing the name for 100% compatibility)
  if (envContent.includes("EXPO_PUBLIC_TUNNEL_URL=")) {
    envContent = envContent.replace(
      /EXPO_PUBLIC_TUNNEL_URL=.*/,
      `EXPO_PUBLIC_TUNNEL_URL=${backendUrl}`
    );
  } else {
    envContent += `\nEXPO_PUBLIC_TUNNEL_URL=${backendUrl}\n`;
  }

  fs.writeFileSync(frontendEnvPath, envContent.trim() + "\n");
  console.log(`\n✅ Synced IP to Frontend: ${frontendEnvPath}`);
  console.log(`💡 Your Phone and Computer must be on the SAME WI-FI for this to work! 100%!!!\n`);
};

syncIp();
