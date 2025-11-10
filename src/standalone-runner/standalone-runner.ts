import { buildBundle, runBundle } from "../bundler/bundle";
import { RunnerSourceFile, sanitizeFiles } from "../bundler/source-file";
import { installGlobalErrorHandler } from "../bundler/error-handler/error-handler.js";

type StandaloneRunnerOptions = {
  files: RunnerSourceFile[];
  entryFile?: string;
  showErrorOverlay?: boolean;
};

export async function standaloneRunner(options: StandaloneRunnerOptions) {
  const { showErrorOverlay = false } = options;

  const files = sanitizeFiles(options?.files);

  // if (!currentEntryFile || typeof currentEntryFile !== "string") {
  //   throw new Error(
  //     'You should provide a string as "entryFile" in the standalone runner options.'
  //   );
  // }

  if (showErrorOverlay === true) {
    installGlobalErrorHandler();
  }

  const { code, css } = await buildBundle(files, currentEntryFile);

  if (!code.trim()) {
    throw new Error("Bundle is empty. Check your entry file exports.");
  }

  console.log({ code });
  await runBundle(code, css, files);
}
