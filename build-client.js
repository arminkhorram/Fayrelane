// build-client.js
const { execSync } = require("child_process");

try {
    console.log("🚀 Installing client dependencies...");
    execSync("cd client && npm install", { stdio: "inherit" });

    console.log("🏗️ Building Next.js client...");
    execSync("cd client && npx next build", { stdio: "inherit" });

    console.log("✅ Next.js build complete!");
} catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
}
