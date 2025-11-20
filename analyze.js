import { rolldown } from "rolldown";
import { visualizer } from "rollup-plugin-visualizer";
import { open } from "fs/promises";

async function analyze() {
  console.log("🔍 Analyzing bundle size...");

  const config = {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: false,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    plugins: [
      visualizer({
        open: true,
        filename: "bundle-analysis.html",
        gzipSize: true,
        brotliSize: true,
      }),
    ],
  };

  try {
    const bundle = await rolldown(config);
    await bundle.write(config.output);
    console.log("✅ Analysis complete! Opening bundle-analysis.html...");
  } catch (error) {
    console.error("❌ Analysis failed:", error);
  }
}

analyze();
