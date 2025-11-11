# React rewrite of the Surfpack UI

This document outlines how to rewrite the current native DOM-based UI (`src/ui`) to a React (TSX) implementation in `src/ui-react-rewrite`, with clear architecture, data contracts, phased migration, and acceptance criteria.

Note: Ongoing progress, decisions, and next steps are tracked in `REACT-REWRITE-STATUS.md` in this same folder. That status log is the journal and shared context between rewrite sessions. Given the assistant’s limited context window, we’ll record only essential context snippets there (key decisions, identifiers, links) to aid continuity. If architectural direction changes, the plan will be updated with rationale and impact, and the status log will capture the evolution.

## Goals

- Feature parity with current UI: File Browser, Code Editor, Navigator, Preview (iframe) with horizontal resizers and themes.
- Keep the public Runner API stable. Consumers of `init()` should not break.
- Improve maintainability, state isolation, and testability with React.
- Modularize styles and replace imperative DOM with declarative components.

## Current UI: features and responsibilities

Based on `src/ui/ui.ts` and related modules:

- App shell (`createUi`)
  - Mounts three areas: FileBrowser (left), CodeEditor (middle), Preview (right), plus the Navigator bar in Preview.
  - Applies themes (light/dark/device-settings) and injects style sheets.
  - Wires FileBrowser -> CodeEditor on file selection, propagates CodeEditor changes up via debounced onFileChange.
  - Creates and cleans up horizontal resizers.
- File Browser (`file-browser.ts`)
  - Displays the files as a tree with folders, icons, and active selection.
  - Supports default folder expansion/collapse and sorts folders first.
  - Emits onFileSelect(file: RunnerFile).
- Code Editor (`code-editor.ts`)
  - CodeMirror 6 editor with JS/TS/JSX/TSX support, VSCode light/dark themes.
  - Debounced onChange to upstream onFileChange.
  - Theme switching and loadFile without echoing changes (isLoadingFile guard).
- Navigator (`navigator.ts`)
  - URL input (pathname only) and a refresh button.
  - onNavigate(route) on Enter; onRefresh() on click.
- Panel Resizer (`panel-resizer/panel-resizer.ts`)
  - Inserts draggable handles between (FileBrowser|Editor) and (Editor|Preview) with min widths.
  - Re-initializes cleanly when panels are toggled.
- Styles (`ui.style.css.ts`, `codemirror.style.css.ts`)
  - CSS-in-TS injection with variables and dark/light override classes.
- Messaging and integration (`src/index.ts`, `iframe-runner/iframe-messaging.ts`)
  - init() owns the iframe creation, message passing, file updates, and route sync.
  - UI provides: previewContainer, fileBrowser, codeEditor, navigator API to init().

Data contract snippets:

- RunnerFile: `{ path: string; content: string }`
- Messages to iframe: `files-update { files, entry, initialRoute }`, `routing-history-load-route { routeToGoTo }`
- Messages from iframe: `iframe-ready`, `build-result-ack`, `routing-history-state-changed { newRoute }`

## Proposed React architecture

Directory: `src/ui-react-rewrite/`

- components/
  - AppShell.tsx — Composition of panels, resizers, theme, and style injection.
  - FileBrowser/
    - FileBrowser.tsx — Tree view, selection, expansion state.
    - types.ts — Tree node types.
  - CodeEditor/
    - CodeEditor.tsx — React wrapper around CodeMirror 6.
  - Navigator/
    - Navigator.tsx — URL input + refresh with callbacks.
  - Preview/
    - PreviewIframe.tsx — Holds the iframe; exposes ref/callback to parent to attach.
  - Resizer/
    - HorizontalResizer.tsx — Reactified resizer logic using refs and effects.
- context/
  - FilesContext.tsx — Files state (RunnerFile[]), active file path, select/update actions.
  - ThemeContext.tsx — theme: "light" | "dark" | "device-settings".
  - RunnerContext.tsx — Optional: bridge to `init()` owner for messaging hooks.
- hooks/
  - useCodeMirror.ts — EditorView mount, updateListener, theme swapping, debounced change.
  - useResizeHandles.ts — Shared logic for resizer sizing/cleanup.
- styles/
  - globals.css.ts — Port of `ui.style.css.ts` (or keep injection function).
  - codemirror.css.ts — Port of `codemirror.style.css.ts`.
- index.tsx
  - export React components and a `createUiReact` adapter to match the current `createUi` shape when embedding into non-React surfaces.

### Component tree (high level)

- AppShell
  - LeftPanel
    - FileBrowser
    - Resizer (FB | Editor) [conditional]
    - CodeEditor
  - Resizer (Left | Preview)
  - PreviewArea
    - Navigator
    - PreviewIframe

### Key props and contracts

- AppShell props
  - container?: HTMLElement (only for adapter); width/height; theme; panel visibility; codeEditorInitialWidth; fileBrowserDefaultExpanded; debounceDelay.
  - callbacks: onFileChange(file: RunnerFile)
  - outputs: exposes ref API for previewContainer (for `init()` iframe attachment) and imperative toggles (for parity).

- FileBrowser props
  - files: RunnerFile[]; activePath?: string; defaultExpanded?: boolean; onSelect(path: string)

- CodeEditor props
  - file: RunnerFile | null; theme: Theme; debounceDelay?: number; onChange(file: RunnerFile)

- Navigator props
  - url: string; onRefresh(): void; onNavigate(route: string): void

- PreviewIframe props
  - src: string; onReady?(): void
  - Exposes underlying iframe via ref for `init()` messaging (the parent still owns messaging).

- Resizer props
  - refs to left/middle/right containers; handleWidth; min sizes; observed visibility changes.

### State management

- Prefer React Context + useReducer over adding a third-party store for now.
- FilesContext state
  - files: RunnerFile[]
  - activePath: string | null
  - actions: setFiles, selectFile(path), updateFile(file)
- ThemeContext
  - theme + a derived effectiveTheme for CodeMirror.

### Styling strategy

- Phase 1: reuse injected CSS-in-TS from existing functions by calling them once from AppShell (least risk, quick parity).
- Phase 2 (optional): convert to CSS Modules or vanilla-extract for better scoping, keeping the same CSS variables.
- Use `lucide-react` for icons rather than imperative `lucide` DOM creation.

## Integration with existing init() flow

Two integration modes:

1. Adapter function for parity

- `createUiReact(container, options, onFileChange)` returns an object matching `UiComponent`:
  - { container, fileBrowser?, codeEditor?, navigator?, previewContainer, setTheme, toggleCodeEditor, toggleFileBrowser, toggleNavigator, destroy }
- Internally renders `<AppShell />` into `container` using `ReactDOM.createRoot(container)` and wires imperative methods via refs.

2. Direct React component usage

- `<SurfpackUI />` (exported from `index.tsx`) accepts the same `UiOptions`/callbacks, manages local file state for responsiveness, and forwards a ref/callback to expose the preview container for iframe attachment.

Initial implementation should provide the adapter for a drop-in swap in `src/index.ts` without changing external APIs.

## Data flow and messaging

- The Runner (outside React) maintains iframe messaging and file update orchestration.
- AppShell receives `onFileChange` and calls it with debounced updates from CodeEditor.
- FileBrowser selection updates FilesContext.activePath and passes the selected file down to CodeEditor.
- Navigator triggers `onNavigate(route)` and `onRefresh()` callbacks provided by the Runner; Runner handles iframe recreation and history messages as today.
- `previewContainer` is a div ref passed back to Runner so it can create/manage the iframe identity and window messaging (unchanged responsibility).

## Edge cases and considerations

- Panel visibility toggling: Resizer must re-calc when panels are hidden/shown; keep `setupResizerForCurrent()` behavior via a visibility-aware effect.
- Theme: "device-settings" should track `prefers-color-scheme` changes (optional v2) and reconfigure CodeMirror theme accordingly.
- Large file content: ensure CodeMirror updates don’t echo back as changes when loading a file (guard maintained).
- Tree perf: memoize derived file tree; avoid re-render storms on editor typing.
- Iframe refresh: preserve `pendingRoute` logic in Runner; Navigator setUrl should show pathname only.
- Cleanup: All event listeners and resize observers disposed on unmount.

## Phased migration plan

Phase 0 — Scaffolding

- Add dependencies: react, react-dom, lucide-react, @types/react, @types/react-dom.
- tsconfig: enable JSX (`"jsx": "react-jsx"`), include `src/ui-react-rewrite/**/*`.
- Ensure bundling outputs both native UI and React UI (no breaking changes). Keep current `rolldown.config.js`/build process; export new entry points.

Phase 1 — Shell + parity skeleton

- AppShell with three columns, resizers, style injection, theme switching.
- Preview container ref exposure.
- Adapter `createUiReact` returning UiComponent-compatible API (no-op implementations for fileBrowser/codeEditor/navigator objects if not needed externally, but aim for parity).

Phase 2 — FileBrowser + CodeEditor + Navigator

- Port FileBrowser: expansion state, active selection, icons via lucide-react, sorting.
- Port CodeEditor: `useCodeMirror` hook; debounced onChange; theme switching; loadFile guarding.
- Port Navigator: controlled input; onRefresh and onNavigate callbacks; pathname-only setUrl.

Phase 3 — Wire to Runner and parity validation

- Switch `index.ts` behind an internal flag to use `createUiReact` in the dev playground.
- Verify file updates propagate to iframe bundler; route navigation works; refresh preserves route.

Phase 4 — Cleanup and optional improvements

- Consider moving styles to CSS Modules or vanilla-extract.
- Add tests for FileBrowser tree building, Editor change debounce, Navigator pathname parsing.

## Tasks breakdown

- Project setup
  - [x] Add React dependencies and JSX support in tsconfig.
  - [x] Create `src/ui-react-rewrite` scaffold with components, contexts, and hooks.
  - [x] Export `createUiReact` and `<SurfpackUI />` in `src/ui-react-rewrite/index.tsx`.
- AppShell and styles
  - [ ] Port style injection; apply theme classes; width/height props respected.
  - [ ] Implement container layout and panel visibility toggles.
- Resizers
  - [ ] Reactify horizontal resizer logic with refs, min widths, and clean cleanup.
- FileBrowser
  - [ ] Build tree derivation; folder expand/collapse; icons; active selection; defaultExpanded.
  - [ ] API: `files`, `activePath`, `onSelect`.
- CodeEditor
  - [ ] Implement `useCodeMirror` hook; loadFile guard (`isLoadingFile`), theme swap, debounce onChange.
- Navigator
  - [ ] Controlled input; `onNavigate`, `onRefresh`, `setUrl(pathname)` behavior.
- Adapter and integration
  - [ ] Implement `createUiReact(container, options, onFileChange)` returning `UiComponent` parity API.
  - [ ] Expose `previewContainer` via ref; ensure `destroy()` unmounts React root and cleans listeners.
  - [ ] Dev playground wiring to toggle native/React UI to validate parity.
- Documentation and tests
  - [ ] Document usage and migration in README.
  - [ ] Add unit tests for tree build and debounce; light e2e for Navigator.

## Minimal contracts (inputs/outputs)

- Inputs
  - `UiOptions`: theme, width/height, visibility flags, `codeEditorInitialWidth`, `fileBrowserDefaultExpanded`, `debounceDelay`.
  - `onFileChange(file: RunnerFile)` from AppShell.
- Outputs
  - `previewContainer: HTMLElement` via adapter for iframe mount.
  - `setTheme(theme)`, `toggle*` methods, `destroy()` via adapter.
- Success criteria
  - No behavior regression against `src/ui` in dev playground.
  - Editor changes update the bundle; route input navigates; refresh rebuilds iframe and restores route.

## Build and packaging notes

- Keep existing builds working; ship React UI as an additional entry without removing native UI initially.
- Ensure tree shaking and small footprint for consumers who don’t use React UI.
- Consider externalizing React as peerDependency if embedding into React apps (optional later).

## Risks and mitigations

- Resizer DOM coordination: Use dedicated refs and effect-controlled listeners; write a small story/test for edge cases.
- Theme sync with CodeMirror: Make theme reactive and memoized.
- Message boundary creep: Keep messaging in Runner to avoid bifurcating responsibilities.
- CSS cascade differences: Start with existing CSS-in-TS; migrate only if needed.

## Acceptance criteria (parity checklist)

- [ ] App renders with the same three-panel layout and navigator.
- [ ] Theme switching works, including device settings fallback.
- [ ] FileBrowser selection loads files into CodeEditor and highlights active file.
- [ ] CodeEditor debounces content changes and triggers bundling.
- [ ] Navigator shows current pathname, navigates on Enter, refresh reloads iframe and preserves route.
- [ ] Resizers work with min widths; re-initialize on panel visibility toggles.
- [ ] `destroy()` fully cleans up and removes event listeners.

---

Prepared for `src/ui-react-rewrite` bootstrap. This plan aims for low-risk parity first, followed by incremental improvements.
