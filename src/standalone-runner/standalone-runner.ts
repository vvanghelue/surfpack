import { buildBundle, runBundle } from "../bundler/bundle";
import { RunnerSourceFile, sanitizeFiles } from "../bundler/source-file";

type StandaloneRunnerOptions = {
  files: RunnerSourceFile[];
  entryFile?: string;
};

export async function standaloneRunner(options: StandaloneRunnerOptions) {
  const files = sanitizeFiles(options?.files);

  if (!options.entryFile || typeof options.entryFile !== "string") {
    throw new Error(
      'You should provide a string as "entryFile" in the standalone runner options.'
    );
  }

  const { code, css } = await buildBundle(files, options.entryFile);

  if (!code.trim()) {
    throw new Error("Bundle is empty. Check your entry file exports.");
  }

  await runBundle(code, css, files);
}
