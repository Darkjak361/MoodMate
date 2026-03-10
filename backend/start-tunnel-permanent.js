const { spawn, spawnSync, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");

const hasCloudflared = () => {
  try {
    if (os.platform() === "win32") {
      const result = spawnSync("where", ["cloudflared"], { shell: true, stdio: "ignore" });
      return result.status === 0;
    } else {
      const result = spawnSync("which", ["cloudflared"], { stdio: "ignore" });
      return result.status === 0;
    }
  } catch (err) {
    return false;
  }
};

const installCloudflared = () => {
  console.log("📦 cloudflared not found. Installing automatically...\n");
  
  try {
    if (os.platform() === "win32") {
      console.log("🔧 Installing cloudflared via winget...");
      execSync("winget install --id Cloudflare.cloudflared --silent", { stdio: "inherit" });
      console.log("✅ cloudflared installed successfully!\n");
    } else if (os.platform() === "darwin") {
      console.log("🔧 Installing cloudflared via Homebrew...");
      execSync("brew install cloudflare/cloudflare/cloudflared", { stdio: "inherit" });
      console.log("✅ cloudflared installed successfully!\n");
    } else {
      console.log("🔧 Installing cloudflared via apt-get...");
      execSync("sudo apt-get update && sudo apt-get install -y cloudflared", { stdio: "inherit" });
      console.log("✅ cloudflared installed successfully!\n");
    }
    return true;
  } catch (err) {
    console.log("❌ Failed to install cloudflared automatically.");
    console.log("📝 Please install manually:");
    if (os.platform() === "win32") {
      console.log("   winget install --id Cloudflare.cloudflared");
    } else if (os.platform() === "darwin") {
      console.log("   brew install cloudflare/cloudflare/cloudflared");
    } else {
      console.log("   sudo apt-get install cloudflared");
    }
    return false;
  }
};

if (!hasCloudflared()) {
  if (!installCloudflared()) {
    process.exit(1);
  }
}

console.log("🔍 Checking cloudflared version...");
try {
  const ver = spawnSync("cloudflared", ["--version"], { encoding: "utf8" });
  if (ver.stdout) {
    console.log(ver.stdout.trim());
  }
} catch (err) {
  console.log("⚠️  Could not determine cloudflared version.");
}
console.log("");

const BACKEND_DIR = __dirname;
const FRONTEND_DIR = path.join(BACKEND_DIR, "..", "frontend");
const FRONTEND_ENV_FILE = path.join(FRONTEND_DIR, ".env.local");
const BACKEND_PID_FILE = path.join(BACKEND_DIR, ".backend.pid");
const CLOUDFLARED_PID_FILE = path.join(BACKEND_DIR, ".cloudflared.pid");

const cleanup = () => {
  console.log("\n🛑 Stopping all processes...");
  
  if (fs.existsSync(BACKEND_PID_FILE)) {
    try {
      const pid = parseInt(fs.readFileSync(BACKEND_PID_FILE, "utf8").trim());
      if (os.platform() === "win32") {
        spawn("taskkill", ["/F", "/PID", pid.toString()], { stdio: "ignore" });
      } else {
        process.kill(pid, "SIGTERM");
      }
      fs.unlinkSync(BACKEND_PID_FILE);
    } catch (error) {}
  }
  
  if (fs.existsSync(CLOUDFLARED_PID_FILE)) {
    try {
      const pid = parseInt(fs.readFileSync(CLOUDFLARED_PID_FILE, "utf8").trim());
      if (os.platform() === "win32") {
        spawn("taskkill", ["/F", "/PID", pid.toString()], { stdio: "ignore" });
      } else {
        process.kill(pid, "SIGTERM");
      }
      fs.unlinkSync(CLOUDFLARED_PID_FILE);
    } catch (error) {}
  }
  
  if (os.platform() === "win32") {
    spawn("taskkill", ["/F", "/IM", "node.exe", "/FI", "WINDOWTITLE eq server.js*"], { stdio: "ignore" });
    spawn("taskkill", ["/F", "/IM", "cloudflared.exe"], { stdio: "ignore" });
  } else {
    spawn("pkill", ["-f", "node.*server.js"], { stdio: "ignore" });
    spawn("pkill", ["-f", "cloudflared.*tunnel"], { stdio: "ignore" });
  }
  
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

const checkBackend = () => {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:5001/api/health", (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
};

const syncTunnelUrl = (url) => {
  if (!url) return;
  
  try {
    fs.writeFileSync(FRONTEND_ENV_FILE, `EXPO_PUBLIC_TUNNEL_URL=${url}\n`);
    console.log(`✅ Synced tunnel URL to frontend: ${url}`);
    console.log(`📝 Updated .env.local - restart your Expo app to use the new URL`);
    console.log(`📝 Frontend will now use: ${url}/api`);
  } catch (error) {
    console.log(`❌ Error syncing URL: ${error.message}`);
  }
};

const waitForBackend = async () => {
  console.log("🔍 Checking if backend server is running on port 5001...");
  for (let i = 0; i < 30; i++) {
    const isRunning = await checkBackend();
    if (isRunning) {
      console.log("✅ Backend server is running!\n");
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.stdout.write(".");
  }
  console.log("\n❌ Backend server is not running on port 5001!");
  console.log("⚠️  Please start your backend server first: cd backend && npm start");
  process.exit(1);
};

const main = async () => {
  if (!fs.existsSync(path.join(BACKEND_DIR, "package.json"))) {
    console.log("❌ package.json not found. Make sure you're in the backend directory.");
    process.exit(1);
  }

  if (!fs.existsSync(path.join(BACKEND_DIR, "server.js"))) {
    console.log("❌ server.js not found. Make sure you're in the backend directory.");
    process.exit(1);
  }

  const isBackendRunning = await checkBackend();
  
  if (!isBackendRunning) {
    console.log("📦 Starting backend server...");
    const backend = spawn("npm", ["start"], {
      cwd: BACKEND_DIR,
      stdio: "ignore",
      detached: true,
      shell: true
    });
    
    backend.unref();
    fs.writeFileSync(BACKEND_PID_FILE, backend.pid.toString());
    
    await waitForBackend();
  } else {
    console.log("✅ Backend server is already running!\n");
  }

  console.log("🌐 Starting cloudflared tunnel...\n");

  const cloudflared = spawn("cloudflared", ["tunnel", "--url", "http://localhost:5001"], {
    shell: true
  });
  
  fs.writeFileSync(CLOUDFLARED_PID_FILE, cloudflared.pid.toString());
  
  let cloudflaredUrl = "";

  cloudflared.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(output);
    
    const urlMatch = output.match(/https:\/\/[a-z0-9.-]+\.(trycloudflare\.com|cfargotunnel\.com)/);
    if (urlMatch) {
      const newUrl = urlMatch[0];
      if (newUrl !== cloudflaredUrl) {
        cloudflaredUrl = newUrl;
        console.log(`\n✅ Cloudflare Tunnel established: ${cloudflaredUrl}\n`);
        
        setTimeout(() => {
          syncTunnelUrl(cloudflaredUrl);
          console.log(`💡 Share this URL with your team: ${cloudflaredUrl}`);
          console.log(`📱 Your mobile app will automatically use this URL!`);
          console.log(`\n✨ Everything is set up! The tunnel will stay active.`);
          console.log(`   Press Ctrl+C to stop everything.\n`);
        }, 500);
      }
    }
  });

  cloudflared.stderr.on("data", (data) => {
    const output = data.toString();
    console.log(output);
    
    const urlMatch = output.match(/https:\/\/[a-z0-9.-]+\.(trycloudflare\.com|cfargotunnel\.com)/);
    if (urlMatch) {
      const newUrl = urlMatch[0];
      if (newUrl !== cloudflaredUrl) {
        cloudflaredUrl = newUrl;
        console.log(`\n✅ Cloudflare Tunnel established: ${cloudflaredUrl}\n`);
        
        setTimeout(() => {
          syncTunnelUrl(cloudflaredUrl);
          console.log(`💡 Share this URL with your team: ${cloudflaredUrl}`);
          console.log(`📱 Your mobile app will automatically use this URL!`);
          console.log(`\n✨ Everything is set up! The tunnel will stay active.`);
          console.log(`   Press Ctrl+C to stop everything.\n`);
        }, 500);
      }
    }
  });

  cloudflared.on("close", (code) => {
    console.log(`\n❌ Cloudflare Tunnel process exited with code ${code}`);
    cleanup();
  });
};

main().catch((error) => {
  console.error("❌ Error:", error);
  cleanup();
});
