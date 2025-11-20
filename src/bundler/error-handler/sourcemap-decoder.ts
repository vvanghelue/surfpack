import { SourceMapConsumer } from "source-map-js";

export interface OriginalPosition {
  source: string | null;
  line: number | null;
  column: number | null;
  name: string | null;
}

export interface StackFrameInfo {
  original: OriginalPosition;
  compiled: {
    line: number;
    column: number;
  };
  functionName?: string;
}

/**
 * Extracts the inline source map from bundled code
 */
const extractInlineSourceMap = (code: string): string | null => {
  const sourceMappingRegex =
    /\/\/# sourceMappingURL=data:application\/json;base64,([^\s]+)/;
  const match = code.match(sourceMappingRegex);
  if (!match) {
    return null;
  }
  try {
    const base64Data = match[1];
    const jsonString = atob(base64Data);
    return jsonString;
  } catch (error) {
    console.error("Failed to decode inline source map:", error);
    return null;
  }
};

/**
 * Parses a stack trace line to extract file, line, and column information
 */
const parseStackTraceLine = (
  line: string
): {
  functionName?: string;
  line: number;
  column: number;
} | null => {
  // Matches patterns like:
  // at functionName (blob:http://localhost:5101/abc123:1:2345)
  // at blob:http://localhost:5101/abc123:1:2345
  // at Object.functionName (blob:http://localhost:5101/abc123:1:2345)
  // Note: The blob URL can contain UUIDs with colons, so we need to match the last :line:column
  const blobPattern = /at (?:(.+?) \()?(blob:[^\)]+):(\d+):(\d+)\)?/;
  const match = line.match(blobPattern);

  if (!match) {
    return null;
  }

  const [, functionName, , lineStr, columnStr] = match;
  return {
    functionName: functionName?.trim(),
    line: parseInt(lineStr, 10),
    column: parseInt(columnStr, 10),
  };
};

/**
 * Decodes a stack trace using the inline source map from bundled code
 */
export const decodeStackTrace = async (
  stack: string,
  bundledCode: string
): Promise<StackFrameInfo[]> => {
  const sourceMapJson = extractInlineSourceMap(bundledCode);
  if (!sourceMapJson) {
    console.warn("No inline source map found in bundled code");
    return [];
  }

  let consumer: SourceMapConsumer;
  try {
    const sourceMapObj = JSON.parse(sourceMapJson);
    consumer = await new SourceMapConsumer(sourceMapObj);
  } catch (error) {
    console.error("Failed to create SourceMapConsumer:", error);
    return [];
  }

  const stackLines = stack.split("\n");
  const frames: StackFrameInfo[] = [];

  for (const line of stackLines) {
    const parsed = parseStackTraceLine(line);
    if (!parsed) {
      continue;
    }

    const originalPosition = consumer.originalPositionFor({
      line: parsed.line,
      column: parsed.column,
    });

    if (originalPosition.source) {
      frames.push({
        original: {
          source: originalPosition.source,
          line: originalPosition.line,
          column: originalPosition.column,
          name: originalPosition.name ?? null,
        },
        compiled: {
          line: parsed.line,
          column: parsed.column,
        },
        functionName: parsed.functionName || originalPosition.name || undefined,
      });
    }
  }

  return frames;
};

/**
 * Gets the original position for a single line/column from bundled code
 */
export const getOriginalPosition = async (
  line: number,
  column: number,
  bundledCode: string
): Promise<OriginalPosition | null> => {
  const sourceMapJson = extractInlineSourceMap(bundledCode);
  if (!sourceMapJson) {
    return null;
  }

  let consumer: SourceMapConsumer;
  try {
    const sourceMapObj = JSON.parse(sourceMapJson);
    consumer = await new SourceMapConsumer(sourceMapObj);
  } catch (error) {
    console.error("Failed to create SourceMapConsumer:", error);
    return null;
  }

  const original = consumer.originalPositionFor({ line, column });

  if (!original.source) {
    return null;
  }

  return {
    source: original.source,
    line: original.line,
    column: original.column,
    name: original.name ?? null,
  };
};
