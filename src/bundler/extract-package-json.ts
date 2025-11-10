export function extractMainEntry(packageJsonString: string): string | null {
  try {
    const packageJson = JSON.parse(packageJsonString);

    if (
      typeof packageJson === "object" &&
      packageJson !== null &&
      "main" in packageJson
    ) {
      const mainEntry = packageJson.main;

      if (typeof mainEntry === "string") {
        return mainEntry;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

export function extractDependencies(
  packageJsonString: string
): Record<string, string> | null {
  try {
    const packageJson = JSON.parse(packageJsonString);

    if (
      typeof packageJson === "object" &&
      packageJson !== null &&
      "dependencies" in packageJson
    ) {
      const dependencies = packageJson.dependencies;

      if (typeof dependencies === "object" && dependencies !== null) {
        return dependencies;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
