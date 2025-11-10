export const reactRuntimeErrorApp = {
  templateName: "React Runtime Error Demo",
  description:
    "Ultra basic React app with runtime errors for testing error handling and debugging capabilities",
  files: [
    {
      path: "package.json",
      content: `{
  "name": "react-runtime-error",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
  }
}`,
    },
    {
      path: "src/index.tsx",
      content: `import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [error, setError] = React.useState(false);
  const [count, setCount] = React.useState(0);

  // This will cause a runtime error when clicked
  const triggerError = () => {
    setError(true);
    // This will throw an error because we're trying to access a property on undefined
    const obj = undefined;
    console.log(obj.nonExistentProperty);
  };

  // This will cause an infinite loop error
  const triggerInfiniteLoop = () => {
    while (true) {
      setCount(c => c + 1);
    }
  };

  // This will cause a type error
  const triggerTypeError = () => {
    const num = 42;
    num.push("not a method");
  };

  if (error) {
    throw new Error("This is a deliberate runtime error!");
  }

  return (
    <div style={{ background: "#eee", minHeight: "100vh", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>React Runtime Error Demo</h1>
      <p>Click the buttons below to trigger different types of runtime errors:</p>
      
      <div style={{ marginBottom: "10px" }}>
        <button 
          onClick={triggerError}
          style={{ 
            padding: "10px 20px", 
            marginRight: "10px",
            backgroundColor: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Trigger Component Error
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button 
          onClick={triggerTypeError}
          style={{ 
            padding: "10px 20px", 
            marginRight: "10px",
            backgroundColor: "#ff8844",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Trigger Type Error
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button 
          onClick={triggerInfiniteLoop}
          style={{ 
            padding: "10px 20px", 
            marginRight: "10px",
            backgroundColor: "#ffaa44",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Trigger Infinite Loop (Warning!)
        </button>
      </div>

      <p style={{ marginTop: "20px", color: "#666" }}>
        Counter: {count}
      </p>
      
      <p style={{ fontSize: "12px", color: "#999", marginTop: "40px" }}>
        This template is designed to test error handling and debugging capabilities.
      </p>
    </div>
  );
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root not found");
}

createRoot(container).render(<App />);
`,
    },
    {
      path: "index.txt",
      content: `Ultra basic React app with runtime errors

This is a single-file React application that demonstrates various runtime errors:
- Component errors that can be caught by error boundaries
- Type errors from calling methods on wrong types
- Infinite loops that can freeze the browser

Use this template to test error handling and debugging features.`,
    },
  ],
  entryFile: "src/index.tsx",
};
