# Surfpack

Run JavaScript/TypeScript code directly in the browser with zero bundling.

## 🌐 Online Demo

**[🚀 Try it now](https://vvanghelue.github.io/surfpack/online/online-demo.html)**

## 💻 Examples

### Vanilla JS, vanilla app

```javascript
import { init } from "surfpack";

const surfpack = init({
  bundlerUrl: "./bundler.html",
  container: document.getElementById("app"),
  files: [
    {
      path: "index.js",
      content: `
        document.body.innerHTML = '<h1>Hello from Surfpack!</h1>';
        console.log('Vanilla JS is running!');
      `,
    },
  ],
  entryFile: "index.js",
  theme: "dark",
  width: "100%",
  height: 600,
});
```

### Vanilla JS, React app

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

### ⚛️ Using React component

```jsx
import React from "react";
import { Surfpack } from "surfpack";

function App() {
  const files = [
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
  ];

  return (
    <Surfpack
      bundlerUrl="./bundler.html"
      files={files}
      entryFile="App.jsx"
      theme="dark"
      width="100%"
      height={600}
      showCodeEditor={true}
      showFileBrowser={true}
      showNavigator={true}
    />
  );
}
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
