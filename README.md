# Surfpack

Run JavaScript/TypeScript code directly in the browser with zero bundling.

## Features

- [x] ES modules powered by esm.sh and sourcemaps
- [x] CSS Loader
- [x] React jsx/tsx compiled using esbuild.wasm
- [x] Client side routing apps compatible (pushState, react router, etc..)
- [ ] Vue, Angular

## 🌐 Online Demo

**[🚀 Try it now](https://vvanghelue.github.io/surfpack/demo/online-demo.html)**

### Example : fully working react

```javascript
import { init } from "surfpack";

const surfpack = init({
  bundlerUrl: "./bundler.html",
  container: document.getElementById("app"),
  files: [
    {
      path: "App.jsx",
      content: `
        import React, { useState } from 'react';
        import { createRoot } from 'react-dom/client';

        function Counter() {
          const [count, setCount] = useState(0);
          return (
            <div>
              <h1>Count: {count}</h1>
              <button onClick={() => setCount(count + 1)}>Increment</button>
            </div>
          );
        }

        const root = createRoot(document.getElementById('root'));
        root.render(<Counter />);
      `,
    },
    {
      path: "index.html",
      content: '<div id="root"></div>',
    },
  ],
  entryFile: "App.jsx",
  theme: "dark",
  width: "100%",
  height: 600,
});
```

## Development

```bash
npm install
npm run dev        # Start development server
```

### 🎮 Development Playground

When running `npm run dev`, you can access the interactive development playground at:

**[http://localhost:5101/src/\_dev-playground/playground](http://localhost:5101/src/_dev-playground/playground)**

## Build for prod

```bash
npm run build:prod # Build for production
```
