import type {
  MessageFilesUpdate,
  MessageFromIframe,
  MessageToIframe,
} from "../../../iframe-runner/iframe-messaging.js";
import type {
  DetailedNormalizedError,
  ErrorOverlaySetup,
} from "../../../bundler/error-handler/global-error-handler.js";

import React from "react";
import type { MutableRefObject } from "react";
import { Navigator } from "../Navigator/Navigator.js";
import { RunnerFile } from "../../../index.js";

export type PreviewProps = {
  files: RunnerFile[];
  entryFile?: string;
  bundlerUrl: string;
  initialRoute?: string;
  areaRef: MutableRefObject<HTMLDivElement | null>;
  showNavigator: boolean;
  onIframeReady?: () => void;
  showErrorOverlay?: boolean;
  errorOverlayErrors?: ErrorOverlaySetup;
  onError?: (error: DetailedNormalizedError) => void;
};

export function Preview({
  files,
  entryFile,
  bundlerUrl,
  areaRef,
  initialRoute = "/",
  showNavigator,
  onIframeReady,
  showErrorOverlay,
  errorOverlayErrors,
  onError,
}: PreviewProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const isIframeReady = React.useRef(false);
  const [route, setRoute] = React.useState(initialRoute);

  React.useEffect(() => {
    sendFiles(files, entryFile);
  }, [files]);

  function sendMessageToIframe(message: MessageToIframe) {
    if (iframeRef.current?.contentWindow && isIframeReady.current) {
      iframeRef.current.contentWindow.postMessage(message, "*");
    } else {
      setTimeout(sendMessageToIframe, 100, message);
    }
  }

  function sendFiles(files: RunnerFile[], entry?: string) {
    const message: MessageFilesUpdate = {
      type: "files-update",
      payload: {
        files: files,
        entry: entry,
        initialRouteState: route,
      },
    };
    sendMessageToIframe(message);
  }

  function sendErrorOverlaySetup() {
    sendMessageToIframe({
      type: "error-configuration-setup",
      payload: {
        showErrorOverlay: showErrorOverlay || false,
        errorOverlayErrors: errorOverlayErrors,
      },
    });
  }

  function onIframePostMessage(event: MessageEvent<unknown>) {
    // Ensure message is from our iframe
    if (
      !iframeRef.current ||
      event.source !== iframeRef.current.contentWindow
    ) {
      return;
    }

    const messageData = event.data as MessageFromIframe;

    if (messageData.type === "iframe-ready") {
      isIframeReady.current = true;
      sendErrorOverlaySetup();
      sendFiles(files, entryFile);
    }

    if (messageData.type === "build-result-ack") {
      if (onIframeReady) {
        onIframeReady();
      }
    }

    if (messageData.type === "routing-history-state-changed") {
      setRoute(messageData.payload.newRoute);
    }

    if (messageData.type === "app-handled-error") {
      if (onError) {
        onError(messageData.payload.error);
      }
    }
  }

  React.useEffect(() => {
    window.addEventListener("message", onIframePostMessage);
    return () => window.removeEventListener("message", onIframePostMessage);
  }, [route]);

  return (
    <div ref={areaRef} className="surfpack-iframe-bundler-container">
      {showNavigator ? (
        <div className="surfpack-iframe-bundler-navigator">
          <Navigator
            route={route}
            onUserTriggerRouteChange={(newRoute) => {
              sendMessageToIframe({
                type: "routing-history-load-route",
                payload: {
                  routeToGoTo: newRoute,
                },
              });
              setRoute(newRoute);
            }}
            onRefresh={() => {
              isIframeReady.current = false;
              if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src;
              }
            }}
          />
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        src={bundlerUrl}
        className="surfpack-iframe-bundler-iframe"
      ></iframe>
    </div>
  );
}
