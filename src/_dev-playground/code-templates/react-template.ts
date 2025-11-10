export const reactApp = {
  templateName: "Working React App",
  description: "Minimal React + TypeScript demo with interactive components",
  files: [
    {
      path: "package.json",
      content: `{
  "name": "react-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
  },
  "dependencies": {
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
  }
}`,
    },
    {
      path: "src/style.css",
      content: `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #ffffff;
}
  `,
    },
    {
      path: "src/index.tsx",
      content: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./style.css";

const container = document.getElementById("root");


// throw new Error("Fake early error");


if (!container) {
  throw new Error("Root element #root not found");
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    },
    {
      path: "src/App.tsx",
      content: `import React from "react";
import HelloWorld from "./components/HelloWorld";
import Counter from "./components/Counter.tsx";
import { BrowserRouter } from "react-router-dom";


export default function App() {
//throw new Error("Root element #root not found");

  React.useEffect(() => {
    async function fetchApi() {
      const res = await fetch("https://localhost:7676/api-proxy-v1/http://localhost:3018/insurance-contracts/api/v2/contracts");
      const data = await res.json();
      console.log(data);
    }
    fetchApi();
  }, []);

    return (
    <main>
        <HelloWorld name="ESM Pack" />
        <Counter />
    </main>
    );
}
`,
    },
    {
      path: "src/components/HelloWorld.tsx",
      content: `import React from "react";

const HelloWorld = ({ name = "React" }) => (
  <section>
    <h1>Hello, {name}!</h1>
    <p>Welcome to your iframe-powered React playground.</p>
  </section>
);

export default HelloWorld;
`,
    },
    {
      path: "src/components/Counter.tsx",
      content: `import React from "react";

const Counter = () => {
  const [count, setCount] = React.useState(0);

  return (
    <section>
      <h2>Counter</h2>
      <p>The button has been clicked {count} times.</p>
      <div>
        <button onClick={() => setCount((value) => value + 1)}>
          Increment
        </button>
        <button onClick={() => setCount(0)}>
          Reset
        </button>
      </div>
    </section>
  );
};

export default Counter;
`,
    },
    {
      path: "index.txt",
      content: `Minimal React + TypeScript demo

- src/index.tsx bootstraps the React root and renders <App />.
- src/App.tsx wires HelloWorld and Counter components.
- src/components/HelloWorld.tsx greets the user.
- src/components/Counter.tsx provides an interactive counter demo.
`,
    },
  ],
  entryFile: "src/index.tsx",
};
