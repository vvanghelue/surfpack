import { rolldown } from "rolldown";
import { execSync, spawn } from "child_process";
import { readFileSync, statSync } from "fs";
import { join } from "path";

const isProduction = process.argv.includes("--production");
const shouldWatch = process.argv.includes("--watch");

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function displayBundleSize() {
  console.log("\n📊 Bundle Size Analysis:");
  console.log("========================");

  try {
    const distFiles = ["dist/index.js", "dist/index.d.ts"];

    distFiles.forEach((file) => {
      try {
        const stats = statSync(file);
        const size = formatBytes(stats.size);
        console.log(`📦 ${file}: ${size}`);

        // Also show gzipped size estimation (rough calculation)
        if (file.endsWith(".js")) {
          const gzippedSize = Math.round(stats.size * 0.3); // Rough estimate
          console.log(`🗜️  ${file} (gzipped ~): ${formatBytes(gzippedSize)}`);
        }
      } catch (err) {
        console.log(`❌ Could not read ${file}: ${err.message}`);
      }
    });
  } catch (error) {
    console.error("❌ Failed to analyze bundle size:", error.message);
  }
}

async function buildBundle() {
  try {
    const config = {
      input: "src/index.ts",
      output: {
        file: "dist/index.js",
        format: "es",
        sourcemap: !isProduction,
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
      },
    };

    if (shouldWatch) {
      console.log("👀 Watching for changes...");

      // Build main entry point
      const mainWatchProcess = spawn(
        "npx",
        [
          "rolldown",
          "src/index.ts",
          "-o",
          "dist/index.js",
          "-f",
          "es",
          "--watch",
          "-s",
        ],
        {
          stdio: "inherit",
        }
      );

      // Build playground entry point for dev mode
      const playgroundWatchProcess = spawn(
        "npx",
        [
          "rolldown",
          "src/_dev-playground/playground.ts",
          "-o",
          "dist/playground.js",
          "-f",
          "es",
          "--watch",
          "-s",
        ],
        {
          stdio: "inherit",
        }
      );

      console.log("📦 Watching main bundle and playground...");

      // Keep the process alive
      process.on("SIGINT", () => {
        console.log("\n🛑 Stopping watch mode...");
        mainWatchProcess.kill();
        playgroundWatchProcess.kill();
        process.exit(0);
      });
    } else {
      // Build main bundle
      const bundle = await rolldown(config);
      await bundle.write(config.output);
      console.log("✅ Main build completed");

      // Build playground bundle in development mode
      if (!isProduction) {
        const playgroundConfig = {
          input: "src/_dev-playground/playground.ts",
          output: {
            file: "dist/playground.js",
            format: "es",
            sourcemap: true,
          },
          resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"],
          },
        };

        const playgroundBundle = await rolldown(playgroundConfig);
        await playgroundBundle.write(playgroundConfig.output);
        console.log("✅ Playground build completed");
      }

      // Generate TypeScript declarations
      try {
        console.log("🔄 Generating TypeScript declarations...");
        execSync(
          "tsc --declaration --declarationMap --emitDeclarationOnly --project tsconfig.json",
          {
            stdio: "inherit",
          }
        );
        console.log("✅ TypeScript declarations generated");
      } catch (error) {
        console.error(
          "❌ Failed to generate TypeScript declarations:",
          error.message
        );
      }

      // Show bundle size analysis for production builds
      if (isProduction) {
        displayBundleSize();
      }
    }
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

buildBundle();
