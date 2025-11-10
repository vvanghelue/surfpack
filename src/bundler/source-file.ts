export interface RunnerSourceFile {
  path: string;
  content?: string;
}

const isRunnerSourceFile = (value: unknown): value is RunnerSourceFile => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<RunnerSourceFile>;
  return typeof candidate.path === "string";
};

export const sanitizeFiles = (value: unknown): RunnerSourceFile[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRunnerSourceFile).map((file) => ({
    path: file.path,
    content: typeof file.content === "string" ? file.content : undefined,
  }));
};
