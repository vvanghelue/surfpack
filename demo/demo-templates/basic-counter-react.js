export const basicCounterReact = {
  templateName: "React Basic Counter",
  description: "A simple counter app built with React hooks",
  files: [
    {
      path: "package.json",
      content: `{
  "name": "react-counter-demo",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "react": "^19",
    "react-dom": "^19"
  }
}`,
    },
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Counter Demo</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    },
    {
      path: "src/style.css",
      content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  max-width: 400px;
  margin: 50px auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.counter {
  margin: 30px 0;
}

.count {
  font-size: 4rem;
  margin: 20px 0;
  font-weight: bold;
  color: #667eea;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

button:active {
  transform: translateY(0);
}

.reset-btn {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.reset-btn:hover {
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
}`,
    },
    {
      path: "src/index.tsx",
      content: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./style.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root not found");
}

createRoot(container).render(<App />);`,
    },
    {
      path: "src/App.tsx",
      content: `import React from "react";

export default function App() {
  const [count, setCount] = React.useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(0);
  const addTen = () => setCount(prev => prev + 10);

  return (
    <div className="app">
      <h1>🚀 Counter App</h1>
      <div className="counter">
        <div className="count">{count}</div>
        <div className="buttons">
          <button onClick={decrement}>- 1</button>
          <button onClick={increment}>+ 1</button>
          <button onClick={addTen}>+ 10</button>
          <button className="reset-btn" onClick={reset}>Reset</button>
        </div>
      </div>
    </div>
  );
}`,
    },
  ],
  entryFile: "src/index.tsx",
};
