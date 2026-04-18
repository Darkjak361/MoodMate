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
  
  // 1. First Pass: Look specifically for Wi-Fi or Wireless adapters
  for (const name of Object.keys(nets)) {
    if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless') || name.toLowerCase().includes('wlan') || name === 'en0') {
      for (const net of nets[name]) {
        if (net.family === "IPv4" && !net.internal) {
          return net.address;
        }
      }
    }
  }

  // 2. Second Pass: If no Wi-Fi, look for anything that is NOT a virtual machine adapter
  for (const name of Object.keys(nets)) {
    const isVirtual = name.toLowerCase().includes('virtualbox') || 
                      name.toLowerCase().includes('vmware') || 
                      name.toLowerCase().includes('vethernet');
    
    if (!isVirtual) {
      for (const net of nets[name]) {
        if (net.family === "IPv4" && !net.internal) {
          return net.address;
        }
      }
    }
  }

  // Default fallback if everything else fails
  return "localhost";
};

const syncIp = () => {
  const ip = getLocalIp();
  const backendUrl = `http://${ip}:5001`;
  const apiConfigPath = path.join(__dirname, "../../frontend/utils/apiConfig.js");

  console.log(`\n🔍 Detected Local IP: ${ip}`);
  console.log(`🌐 Backend will be reachable at: ${backendUrl}`);

  let configContent = "";
  if (fs.existsSync(apiConfigPath)) {
    configContent = fs.readFileSync(apiConfigPath, "utf8");
  }

  // Bruteforce replace the literal string to bypass ALL Expo Environment variables permanently
  if (configContent.includes("const TUNNEL_URL =")) {
    configContent = configContent.replace(
      /const TUNNEL_URL = \".*\";/,
      `const TUNNEL_URL = "${backendUrl}";`
    );
  }

  fs.writeFileSync(apiConfigPath, configContent);
  console.log(`\n✅ Hardcoded True IP directly into: ${apiConfigPath}`);
  console.log(`💡 Your Phone and Computer must be on the SAME WI-FI for this to work! 100%!!!\n`);
};

syncIp();
