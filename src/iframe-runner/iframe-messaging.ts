import { RunnerSourceFile } from "../bundler/source-file";

/**
 * Messages sent from the iframe to the parent window
 */
export type MessageIframeReady = { type: "iframe-ready" };
export type MessageBuildResultAck = {
  type: "build-result-ack";
  payload: {
    fileCount: number;
    success: boolean;
    error?: string;
  };
};
export type MessageFromIframe = MessageIframeReady | MessageBuildResultAck;

/**
 * Messages sent from the parent window to the iframe
 */
export type MessageFilesUpdate = {
  type: "files-update";
  payload: {
    files: RunnerSourceFile[];
    entry?: string;
  };
};

export type MessageToIframe = MessageFilesUpdate;

export const postToParent = (message: MessageFromIframe): void => {
  window.parent.postMessage(message, "*");
};
