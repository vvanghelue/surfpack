import { execSync } from "child_process";

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
  process.exit(1);
}
