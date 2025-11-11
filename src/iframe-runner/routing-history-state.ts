import type {
  MessageHistoryStateChanged,
  MessageLoadRoute,
} from "./iframe-messaging";
import { postToParent } from "./iframe-messaging";

//@see ./event-handlers.ts
//@see ../ui/navigator";

/**
 * child iframe will comunicate to its parent about route change
 * example => new route : /new-route?param=foo
 *
 * parent will trigger
 */

let isInitialized = false;
let currentRoute = "";

/**
 * Initialize routing history state management
 * Sets up listeners for popstate and pushstate/replacestate events
 * @param initialRoute - The initial route to set (defaults to "/")
 */
export function initializeRoutingState(initialRoute: string = "/"): void {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  // Initialize virtual routing with the provided initial route
  window.history.replaceState(null, "", initialRoute);
  currentRoute = initialRoute;

  // Listen for popstate events (back/forward button)
  window.addEventListener("popstate", handleRouteChange);

  // Intercept pushState and replaceState to catch programmatic navigation
  interceptHistoryMethods();

  // Initial route report to parent
  tellParentAboutRouteChange();
}

/**
 * Get the current route (pathname + search + hash)
 */
function getCurrentRoute(): string {
  return (
    window.location.pathname + window.location.search + window.location.hash
  );
}

/**
 * Notify parent window about route changes in the iframe
 */
export function tellParentAboutRouteChange(): void {
  const newRoute = getCurrentRoute();

  if (newRoute === currentRoute) {
    return; // No change
  }

  currentRoute = newRoute;

  const message: MessageHistoryStateChanged = {
    type: "routing-history-state-changed",
    payload: {
      newRoute,
    },
  };

  postToParent(message);
}

/**
 * Apply route change requested by the parent window
 */
export function applyRouteChangeFromParent(message: MessageLoadRoute): void {
  const { routeToGoTo } = message.payload;

  if (!routeToGoTo) {
    console.warn("No route provided in load route message");
    return;
  }

  // Prevent notifying parent about this change since it originated from parent
  const originalRoute = currentRoute;
  currentRoute = routeToGoTo;

  try {
    // Use pushState to navigate without page reload
    window.history.pushState(null, "", routeToGoTo);

    // Trigger a synthetic popstate event for apps that rely on it
    const popstateEvent = new PopStateEvent("popstate", {
      state: null,
    });
    window.dispatchEvent(popstateEvent);
  } catch (error) {
    console.error("Failed to navigate to route:", routeToGoTo, error);
    // Restore original route on error
    currentRoute = originalRoute;
  }
}

/**
 * Handle route changes (from popstate or intercepted history methods)
 */
function handleRouteChange(): void {
  tellParentAboutRouteChange();
}

/**
 * Intercept history.pushState and history.replaceState to detect programmatic navigation
 */
function interceptHistoryMethods(): void {
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function (state, title, url) {
    originalPushState.call(this, state, title, url);
    // Use setTimeout to ensure the URL has been updated
    setTimeout(handleRouteChange, 0);
  };

  window.history.replaceState = function (state, title, url) {
    originalReplaceState.call(this, state, title, url);
    // Use setTimeout to ensure the URL has been updated
    setTimeout(handleRouteChange, 0);
  };
}

/**
 * Clean up routing state management
 */
export function destroyRoutingState(): void {
  if (!isInitialized) {
    return;
  }

  window.removeEventListener("popstate", handleRouteChange);
  isInitialized = false;
}
