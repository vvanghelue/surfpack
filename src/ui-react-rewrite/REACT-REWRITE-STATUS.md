# React Rewrite Status Log

This file is the living status log and session journal for the React rewrite. It’s the single source of truth we’ll use as context between rewrite sessions.

- Location: `src/ui-react-rewrite/REACT-REWRITE-STATUS.md`
- Purpose: Track decisions, work done, open questions, and next actions.
- Usage: Append a new entry at the top for each session/day.
- Context policy: We’ll add essential context snippets here when needed to bridge sessions. Keep entries concise and focused on decisions, identifiers, and links to code. Avoid large dumps (the assistant context window is limited).
- Architecture evolution: If we determine the architecture needs to be rethought, we will update the plan and documents accordingly. Record the rationale, expected impact, and links to relevant code in this log.

## Entry template

```
### [YYYY-MM-DD] - step {number} — Session summary
- Done:
  - ...
- Decisions:
  - ...
- Next actions:
  - ...
- Open questions/risks:
  - ...
```
### 2025-11-11 - step 15 — Legacy stubs removed
- Done:
  - Deleted the remaining `src/ui/**` stub modules, including the resizer helpers and style re-exports, leaving React as the only shipped UI implementation.
  - Updated `index.ts` to source `createUi` and UI types from `ui-react-rewrite`, re-exporting the adapters to preserve the public API.
  - Dropped the deprecated `implementation` flag from `UiOptions` and the runner, removing the last legacy toggle.
- Decisions:
  - Retire the legacy `src/ui` import path; consumers should rely on the root exports or import directly from `ui-react-rewrite` if needed.
- Next actions:
  - Audit docs, samples, and downstream usage notes for references to the removed `src/ui` modules.
- Open questions/risks:
  - Some consumers may still reference deep `src/ui` paths; provide migration guidance if reports surface.


### 2025-11-11 - step 14 — Legacy UI sunset

- Done:
  - Replaced `createUi` with the React adapter and downgraded the legacy DOM modules to stubs/type re-exports so build artifacts no longer ship the old implementation.
  - Relocated shared CSS helpers into `ui-react-rewrite/styles` and updated hooks/components to rely on them.
  - Simplified the dev playground to always boot the React UI and removed the implementation toggle.
- Decisions:
  - Keep thin stub modules (`src/ui/**`) that re-export React types/functions to preserve import stability while signalling the legacy API is deprecated.
- Next actions:
  - Run a bundle diff to confirm `lucide` and other legacy-only assets drop from the output.
- Open questions/risks:
  - External consumers importing legacy classes may now hit runtime throws; audit documentation to flag the breaking change before release.

### 2025-11-11 - step 12 — Preview container ready gate

- Done:
  - Deferred iframe injection in `init()` until the React preview container reports its `surfpack-iframe-bundler-iframe` div, retrying with `requestAnimationFrame` to avoid React unmounting the iframe.
  - Confirmed the dev playground now loads the React UI preview (Playwright + manual navigator value check).
  - Re-ran `npm run typecheck` post-change.
- Decisions:
  - Treat the preview container as ready once it carries the expected class rather than adding a dedicated event API.
- Next actions:
  - Light regression pass on navigator refresh to ensure the delayed mount still plays nicely with iframe re-creation.
- Open questions/risks:
  - Need to watch for future refactors that replace the preview container class name; the ready check currently keys off that selector.

### 2025-11-11 - step 13 — Router template sanity test

- Done:
  - Used Playwright to select the React Router demo template in the playground and verified navigation between Home → About → Contact updates the iframe and navigator input.
- Decisions:
  - Keep using the playground’s navigator field as our quick health check for iframe route sync.
- Next actions:
  - Extend automated checks to cover counter route interactions once we wire in testing utilities.
- Open questions/risks:
  - None surfaced; rely on additional QA once we introduce scripted integration tests.

### 2025-11-11 - step 11 — Pointer-driven resizers

- Done:
  - Refactored `useHorizontalResizers` to expose pointer event bindings so `ResizeHandle` owns drag capture while keeping iframe guards intact.
  - Updated `AppShell` to spread the new handlers onto each handle and removed direct DOM listener refs.
  - Ran `npm run typecheck` to validate the refactor stays type-safe.
- Decisions:
  - Keep pointer capture and active-handle class toggling inside the hook to avoid leaking imperative state to consumers.
  - Continue with the legacy width clamp math until we introduce persisted panel width state.
- Next actions:
  - Exercise the dev playground (mouse + touch) to ensure the resizers behave across implementation toggles.
  - Verify Safari still respects the iframe pointer guard now that pointer events originate from React.
- Open questions/risks:
  - Need manual QA around pointer cancel/escape flows to guarantee the cursor and preview guard always reset.

### 2025-11-11 - step 10 — Resizer handle component

- Done:
  - Introduced a `ResizeHandle` React component to wrap the horizontal resizer DOM and keep aria/pointer affordances localised.
  - Swapped the raw handle divs in `AppShell` for the new component while continuing to drive drag behaviour via `useHorizontalResizers`.
  - Re-ran `npm run typecheck` after the refactor to ensure the new component signature lines up with existing refs.
- Decisions:
  - Keep the existing hook as the single owner of drag logic until we port the listener wiring into React.
- Next actions:
  - Follow through on Reactifying the drag listeners so `ResizeHandle` can own pointer events without the adapter-level hook.
  - Exercise the playground resizers to confirm the hidden/visible toggles still update handle visibility properly when panels are toggled.
- Open questions/risks:
  - Once we fold pointer events into the component, we need to ensure iframe pointer guards stay in sync across Safari and Chromium.

### 2025-11-11 - step 9 — Preview component breakout

- Done:
  - Split the preview iframe area into a dedicated `Preview` component and wired it into `AppShell` to reflect the planned component hierarchy.
  - Updated AppShell to share the navigator markup via the new component while preserving refs for the resizer hook and adapter hand-off.
  - Re-ran `npm run typecheck` to confirm the refactor kept type safety intact.
- Decisions:
  - Keep navigator rendering scoped inside the new Preview component as we iterate toward a standalone preview module.
- Next actions:
  - Exercise dev playground toggles to ensure the extracted preview wrapper keeps drag/refresh behaviour in sync with the legacy UI.
  - Continue carving out resizer handle components so drag logic can move entirely into React.
- Open questions/risks:
  - Need to watch for subtle ref timing regressions when we later memoize Preview; adapter expects the preview container synchronously.

### 2025-11-11 - step 8 — Adapter wiring + state glue

- Done:
  - Filled out `createUiReact` adapter to satisfy the legacy `UiComponent` contract while mounting the React shell and keeping preview container hand-off intact.
  - Hooked React `AppShell`, `FileBrowser`, `CodeEditor`, and `Navigator` components together with shared resizer and CodeMirror hooks for parity with the imperative UI.
  - Added `<SurfpackUI />` uncontrolled/controlled support so React hosts can embed the UI directly and stay in sync with adapter state updates.
- Decisions:
  - Reuse a shared `upsertFile` helper between adapter and component surfaces to avoid diverging file mutation semantics.
- Next actions:
  - Exercise playground toggles to validate navigator refresh and resizer behaviour across React vs legacy implementations.
  - Audit bundler/watch outputs to confirm React-only code remains tree-shakeable and `lucide-react` stays externalised as intended.
- Open questions/risks:
  - Need to verify iframe pointer-events guard behaves in Safari during drag operations.
  - Watch for redundant renders when external consumers rapidly replace file arrays via `setFiles`.

### 2025-11-11 - step 7 — React surface + parity fix

- Done:
  - Added `SurfpackUI` forwardRef wrapper so React hosts can embed the UI directly while capturing the preview container callback.
  - Centralised file upsert logic in `createUiReact` to keep adapter/component in sync and suppress spurious `onFileChange` triggers from `updateContent`.
- Decisions:
  - Reuse the shared helper across adapter and component to avoid diverging file mutation behaviour.
- Next actions:
  - Document the new `SurfpackUI` entry point with example usage once we draft consumer docs.
  - Verify package exports include the component when we run the next build.
- Open questions/risks:
  - Need to confirm bundling keeps the React surface tree-shakeable for consumers sticking with the legacy UI.

### 2025-11-11 - step 6 — Rolldown TSX support

- Done:
  - Added `.tsx`/`.jsx` extensions to both main and playground Rolldown configs so React components resolve during builds.
  - Verified `npm run build` succeeds end-to-end (main bundle, playground bundle, declaration emit).
- Decisions:
  - Stick with the existing custom build script but keep `rolldown.config.js` in sync if we refactor the CLI watch path later.
- Next actions:
  - Ensure watch-mode CLI uses the shared config when we revisit dev ergonomics.
- Open questions/risks:
  - Watch commands still invoke `npx rolldown …` directly; confirm they pick up TSX resolution or route them through the config when we touch that flow.

### 2025-11-11 - step 5 — React UI opt-in plumbing

- Done:
  - Added `implementation` flag to `UiOptions` and taught `init()` to pick `createUiReact` when requested.
  - Updated dev playground controls to toggle legacy vs React UI (defaulting to React) while reusing the existing runner container.
  - Normalised `.js` import suffixes in the React rewrite modules and reran `npm run typecheck`.
- Decisions:
  - Keep React UI behind explicit opt-in while parity is validated, but dogfood it in the playground by default.
- Next actions:
  - Exercise playground templates while switching implementations to confirm navigator/resizer parity and iframe lifecycle stability.
  - Plan when to flip the default `init()` path to React once manual QA looks good.
- Open questions/risks:
  - Need to watch for iframe mount churn or stale file state when toggling implementations rapidly in dev.

### 2025-11-11 - step 4 — Resizers + panel toggles parity

- Done:
  - Added `useHorizontalResizers` hook replicating legacy drag logic (min widths, pointer guard) and reused panel-resizer styles.
  - Reworked `AppShell` layout to keep panel containers mounted, expose resize handles, and hand preview div via new refs.
  - Preserved initial editor width from options while allowing resizer overrides; ran `npm run typecheck`.
- Decisions:
  - Allow right handle to resize file browser when editor hidden to avoid inert handles; keep existing CSS handles to minimise cosmetic changes.
- Next actions:
  - Run through dev playground to validate drag/toggle parity and confirm iframe messaging unaffected.
  - Evaluate storing panel widths in adapter state if we need persistence across destroy/recreate cycles.
- Open questions/risks:
  - Need manual QA on pointer capture around iframe during drag, especially in Safari.
  - Confirm resizer behaviour when window resizes aggressively or when both FB/editor toggled off and on rapidly.

---

### 2025-11-11 - step 3 — CodeEditor + Navigator wired

- Done:
  - Added React `CodeEditor` with `useCodeMirror` hook (theme swap, guarded updates, debounced change propagation).
  - Ported Navigator to React, preserving refresh/navigate semantics and sanitising URLs for parity.
  - Updated `AppShell` and `createUiReact` adapter to wire file state, code editor/navigator facades, and preview container handoff.
- Decisions:
  - Keep adapter-managed state as the source of truth and re-render after the debounced editor callback so external consumers receive current file content.
- Next actions:
  - Reactify horizontal resizers and visibility toggles to match legacy sizing behaviour.
  - Exercise adapter in playground/runner flow to validate file loading and navigation round-trips.
- Open questions/risks:
  - Need runtime validation that CodeMirror theme switching stays in sync with `device-settings` preference after hydration.
  - Confirm URL sanitisation still covers edge inputs (hash/query combos) before exposing in playground.

---

### 2025-11-11 - step 2 — FileBrowser scaffolded

- Done:
  - Ported FileBrowser to React with folder expansion, icon parity, and active file highlighting.
  - Integrated FileBrowser into `AppShell`, including runtime width/height handling and preview container wiring.
  - Added stateful `createUiReact` adapter that tracks files/active path and exposes a FileBrowser-compatible facade.
- Decisions:
  - Keep adapter-owned state for files/activePath to mirror imperative API while React components evolve.
- Next actions:
  - Implement React CodeEditor wrapper plus shared state for loaded file content.
  - Provide Navigator component and wire adapter callbacks for refresh/navigate.
  - Synchronize adapter preview container lifecycle with runner once iframe integration begins.
- Open questions/risks:
  - Ensure file selection triggers editor loading without double renders once CodeEditor lands.
  - Confirm preview container availability timing for runner integration.

### 2025-11-11 - step 1 — Initial setup

- Done:
  - Created this status log and declared it as the canonical journal between sessions.
  - Moved `REACT-REWRITE.md` into `src/ui-react-rewrite/`.
  - Added React dependencies and types; enabled JSX in `tsconfig.json`.
  - Scaffolded `src/ui-react-rewrite` structure (components, context, hooks, styles).
  - Implemented `AppShell` skeleton and `createUiReact` adapter (mounts React UI and exposes UiComponent parity methods).
- Decisions:
  - Keep Runner messaging outside React; React handles UI only.
- Next actions:
  - Scaffold `src/ui-react-rewrite` with component folders and an adapter (`createUiReact`).
  - Add React deps and enable JSX in `tsconfig.json` (non-breaking; ship both UIs initially).
  - Wire resizer logic into React (Resizer component) respecting visibility toggles.
  - Implement FileBrowser, CodeEditor (useCodeMirror), Navigator components.
  - Integrate with Runner in dev playground to validate parity.
- Open questions/risks:
  - Packaging strategy to keep React UI tree-shakeable for non-React consumers.
  - Decide on `peerDependencies` vs bundled React for downstreams (likely peer).
