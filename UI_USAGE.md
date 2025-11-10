# Surfpack UI Components

This document explains how to use the new UI components instead of the custom `_dev-tester` implementation.

## Overview

The UI system provides a complete code editing environment with:

- **File Browser** (left panel): Tree view of project files
- **Code Editor** (center panel): Monaco-based editor with syntax highlighting
- **Preview Area** (right panel):
  - Navigator bar with URL display and refresh button
  - Iframe containing the bundled application

## Usage

### Basic Setup

```typescript
import { init } from "surfpack";

const runner = init({
  container: document.getElementById("app"),
  files: [
    {
      path: "App.tsx",
      content:
        "export default function App() { return <div>Hello World</div> }",
    },
    {
      path: "index.tsx",
      content: 'import App from "./App"; console.log("App loaded");',
    },
  ],
  entryFile: "index.tsx",
  ui: {
    width: 1400,
    height: 800,
    showCodeEditor: true,
    showFileBrowser: true,
    showNavigator: true,
  },
});
```

### UI Options

```typescript
type UiOptions = {
  width?: number; // Default: 1200
  height?: number; // Default: 800
  showCodeEditor?: boolean; // Default: true
  showFileBrowser?: boolean; // Default: true
  showNavigator?: boolean; // Default: true
};
```

### Features

1. **File Browser**
   - Tree structure display
   - File type icons
   - Click to switch files
   - Folder expand/collapse

2. **Code Editor**
   - Syntax highlighting for JS/TS/JSX/TSX
   - Live editing with auto-save
   - CodeMirror-based implementation

3. **Navigator**
   - URL display
   - Refresh button
   - Clean, minimal interface

4. **Auto-synchronization**
   - File changes in editor automatically update the bundle
   - File browser stays in sync with file updates
   - Real-time preview updates

### Example Implementation

See `src/_dev-tester/dev-ui-demo.ts` for a complete working example that includes:

- Template switching
- Full UI integration
- Error handling
- Debug mode

## Migration from \_dev-tester

Instead of manually creating DOM elements and managing state:

```typescript
// OLD: Manual UI setup
const mainContainer = document.createElement("div");
mainContainer.style.display = "flex";
// ... lots of manual DOM manipulation

let view = new EditorView({
  parent: document.body.querySelector("#code-editor")!,
  // ... manual editor setup
});

let fileBrowser = new FileBrowser(
  document.querySelector("#file-browser"),
  files,
  (path) => {
    /* manual file switching */
  }
);
```

Now use the integrated UI system:

```typescript
// NEW: Integrated UI system
const runner = init({
  container: rootElement,
  files: myFiles,
  entryFile: "index.tsx",
  ui: {
    width: 1400,
    height: 800,
    showCodeEditor: true,
    showFileBrowser: true,
    showNavigator: true,
  },
});

// All file management, editor updates, and UI synchronization
// is handled automatically!
```

## Benefits

1. **Less boilerplate**: No manual DOM creation or event handling
2. **Better integration**: Components work together seamlessly
3. **Consistent styling**: Unified design system
4. **Auto-sync**: File changes propagate automatically
5. **Type safety**: Full TypeScript support
6. **Extensible**: Easy to customize and extend
