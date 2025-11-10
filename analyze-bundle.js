import esbuild from "esbuild";
import { config } from "./esbuild.config.js";

const metaConfig = {
  ...config,
  metafile: true,
  outfile: "dist/index.js",
};

async function analyzeBuild() {
  try {
    const result = await esbuild.build(metaConfig);

    // Analyze the bundle
    console.log("\n📊 Bundle Analysis:");
    console.log("===================");

    const { inputs, outputs } = result.metafile;

    // Show input files and their sizes
    console.log("\n📁 Input Files:");
    Object.entries(inputs).forEach(([file, info]) => {
      const size = (info.bytes / 1024).toFixed(1);
      console.log(`  ${file}: ${size} KB`);
    });

    // Show output files
    console.log("\n📦 Output Files:");
    Object.entries(outputs).forEach(([file, info]) => {
      const size = (info.bytes / 1024).toFixed(1);
      console.log(`  ${file}: ${size} KB`);
    });

    // Show which dependencies are included
    console.log("\n🔗 Dependencies Included:");
    const dependencies = new Set();
    Object.keys(inputs).forEach((file) => {
      if (file.includes("node_modules")) {
        const match = file.match(/node_modules\/([^\/]+)/);
        if (match) {
          dependencies.add(match[1]);
        }
      }
    });

    if (dependencies.size > 0) {
      dependencies.forEach((dep) => {
        console.log(`  ✅ ${dep}`);
      });
    } else {
      console.log("  ⚠️ No external dependencies detected in bundle");
    }

    console.log("\n✅ Analysis complete");
  } catch (error) {
    console.error("❌ Analysis failed:", error);
  }
}

analyzeBuild();
