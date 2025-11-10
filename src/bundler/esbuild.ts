type NativeEsbuildModule = typeof import("esbuild");

export type Esbuild = Pick<
  NativeEsbuildModule,
  "initialize" | "build" | "formatMessages"
>;

let esbuildPromise: Promise<Esbuild> | undefined;

const isEsbuild = (value: unknown): value is Esbuild => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<Esbuild>;
  return (
    typeof candidate.initialize === "function" &&
    typeof candidate.build === "function" &&
    typeof candidate.formatMessages === "function"
  );
};

const resolveEsbuild = (module: unknown): Esbuild => {
  if (isEsbuild(module)) {
    return module;
  }
  if (typeof module === "object" && module !== null) {
    const record = module as { default?: unknown; esbuild?: unknown };
    if (isEsbuild(record.default)) {
      return record.default;
    }
    if (isEsbuild(record.esbuild)) {
      return record.esbuild;
    }
  }
  throw new Error("Failed to load esbuild-wasm initialize function.");
};

export const ensureEsbuild = (): Promise<Esbuild> => {
  if (!esbuildPromise) {
    esbuildPromise = (async () => {
      const esbuildModule = (await import(
        "https://esm.sh/esbuild-wasm@0.20.2?bundle"
      )) as unknown;
      const esbuild = resolveEsbuild(esbuildModule);

      await esbuild.initialize({
        wasmURL: "https://esm.sh/esbuild-wasm@0.20.2/esbuild.wasm",
        worker: true,
      });
      return esbuild;
    })();
  }
  return esbuildPromise;
};
