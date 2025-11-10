import { rolldown } from "rolldown";
import { execSync, spawn } from "child_process";

const isProduction = process.argv.includes("--production");
const shouldWatch = process.argv.includes("--watch");

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
        extensions: [".ts", ".js"],
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
          "src/dev-playground/playground.ts",
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
          input: "src/dev-playground/playground.ts",
          output: {
            file: "dist/playground.js",
            format: "es",
            sourcemap: true,
          },
          resolve: {
            extensions: [".ts", ".js"],
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
    }
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

buildBundle();
