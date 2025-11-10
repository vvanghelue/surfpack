export const reactRouterApp = {
  templateName: "React Router Demo",
  description:
    "A complete React application demonstrating client-side routing with React Router DOM",
  files: [
    {
      path: "package.json",
      content: `{
  "name": "react-router-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
  },
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "react-router-dom": "^7"
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

nav {
  background-color: #f0f0f0;
  padding: 1rem;
  margin-bottom: 2rem;
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 1rem;
}

nav a {
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

nav a:hover {
  background-color: #e0e0e0;
}

nav a.active {
  background-color: #007bff;
  color: white;
}

.page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page h1 {
  color: #333;
  margin-bottom: 1rem;
}

.counter-section {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.counter-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin: 0 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.counter-button:hover {
  background-color: #0056b3;
}

.counter-button.reset {
  background-color: #6c757d;
}

.counter-button.reset:hover {
  background-color: #545b62;
}

.card {
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.error-page {
  text-align: center;
  color: #dc3545;
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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Counter from "./pages/Counter";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/counter" element={<Counter />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
`,
    },
    {
      path: "src/components/Layout.tsx",
      content: `import React from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
`,
    },
    {
      path: "src/components/Navigation.tsx",
      content: `import React from "react";
import { NavLink } from "react-router-dom";

const Navigation: React.FC = () => {
  return (
    <nav>
      <ul>
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "active" : ""}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/about" 
            className={({ isActive }) => isActive ? "active" : ""}
          >
            About
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => isActive ? "active" : ""}
          >
            Contact
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/counter" 
            className={({ isActive }) => isActive ? "active" : ""}
          >
            Counter Demo
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
`,
    },
    {
      path: "src/pages/Home.tsx",
      content: `import React from "react";

const Home: React.FC = () => {
  return (
    <div className="page">
      <h1>Welcome to React Router Demo</h1>
      <div className="card">
        <p>
          This is the home page of a React application demonstrating routing 
          capabilities using React Router DOM v6.
        </p>
        <h2>Features:</h2>
        <ul>
          <li>BrowserRouter for client-side routing</li>
          <li>Navigation with active link highlighting</li>
          <li>Multiple pages with different content</li>
          <li>404 error handling for unknown routes</li>
          <li>Responsive layout with modern CSS</li>
        </ul>
        <p>
          Use the navigation above to explore different pages in this application.
        </p>
      </div>
    </div>
  );
};

export default Home;
`,
    },
    {
      path: "src/pages/About.tsx",
      content: `import React from "react";

const About: React.FC = () => {
  return (
    <div className="page">
      <h1>About This Demo</h1>
      <div className="card">
        <h2>Technology Stack</h2>
        <ul>
          <li><strong>React 18:</strong> Modern React with hooks and concurrent features</li>
          <li><strong>React Router DOM v6:</strong> Declarative routing for React applications</li>
          <li><strong>TypeScript:</strong> Type-safe JavaScript development</li>
          <li><strong>CSS:</strong> Custom styling with modern CSS features</li>
        </ul>
      </div>
      
      <div className="card">
        <h2>Routing Features</h2>
        <p>This application demonstrates:</p>
        <ul>
          <li>Browser-based routing (no hash fragments)</li>
          <li>Nested routing with layout components</li>
          <li>Active navigation link styling</li>
          <li>Programmatic navigation capabilities</li>
          <li>404 error page handling</li>
        </ul>
      </div>
      
      <div className="card">
        <h2>Project Structure</h2>
        <pre style={{ textAlign: "left", backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "4px" }}>
          src/
          ├── App.tsx              # Main app with router setup
          ├── components/
          │   ├── Layout.tsx       # Main layout wrapper
          │   └── Navigation.tsx   # Navigation component
          └── pages/
              ├── Home.tsx         # Home page
              ├── About.tsx        # About page
              ├── Contact.tsx      # Contact page
              ├── Counter.tsx      # Interactive counter demo
              └── NotFound.tsx     # 404 error page
        </pre>
      </div>
    </div>
  );
};

export default About;
`,
    },
    {
      path: "src/pages/Contact.tsx",
      content: `import React from "react";

const Contact: React.FC = () => {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: ""
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="page">
        <div className="card">
          <h1>Thank You!</h1>
          <p>Your message has been submitted successfully.</p>
          <p><em>Note: This is just a demo - no actual message was sent.</em></p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Contact Us</h1>
      <div className="card">
        <p>Get in touch with us using the form below:</p>
        
        <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem" }}>
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px"
              }}
            />
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem" }}>
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px"
              }}
            />
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="message" style={{ display: "block", marginBottom: "0.5rem" }}>
              Message:
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                resize: "vertical"
              }}
            />
          </div>
          
          <button
            type="submit"
            className="counter-button"
            style={{ width: "auto" }}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
`,
    },
    {
      path: "src/pages/Counter.tsx",
      content: `import React from "react";

const Counter: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [step, setStep] = React.useState(1);

  const increment = () => setCount(count + step);
  const decrement = () => setCount(count - step);
  const reset = () => setCount(0);

  return (
    <div className="page">
      <h1>Interactive Counter</h1>
      <div className="card">
        <p>This is an interactive counter component demonstrating state management.</p>
        
        <div className="counter-section">
          <h2>Count: {count}</h2>
          
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="step" style={{ display: "block", marginBottom: "0.5rem" }}>
              Step size:
            </label>
            <input
              id="step"
              type="number"
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              min="1"
              style={{
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "100px"
              }}
            />
          </div>
          
          <div>
            <button onClick={increment} className="counter-button">
              + {step}
            </button>
            <button onClick={decrement} className="counter-button">
              - {step}
            </button>
            <button onClick={reset} className="counter-button reset">
              Reset
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3>Counter Information</h3>
        <ul>
          <li>Current value: <strong>{count}</strong></li>
          <li>Is positive: <strong>{count > 0 ? "Yes" : "No"}</strong></li>
          <li>Is even: <strong>{count % 2 === 0 ? "Yes" : "No"}</strong></li>
          <li>Absolute value: <strong>{Math.abs(count)}</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default Counter;
`,
    },
    {
      path: "src/pages/NotFound.tsx",
      content: `import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="page">
      <div className="error-page">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="counter-button" style={{ textDecoration: "none", display: "inline-block" }}>
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
`,
    },
    {
      path: "index.txt",
      content: `React Router Demo Application

This is a comprehensive React application demonstrating client-side routing with React Router DOM v7.

Features:
- BrowserRouter for modern routing
- Navigation with active link highlighting  
- Multiple pages with different content
- 404 error handling for unknown routes
- Interactive counter component
- Contact form with state management
- Responsive layout with modern CSS

The application includes:
- src/index.tsx: Application bootstrap
- src/App.tsx: Main app with router setup  
- src/components/Layout.tsx: Layout wrapper
- src/components/Navigation.tsx: Navigation component
- src/pages/: Individual page components
- src/style.css: Application styling

Perfect for learning React Router concepts and patterns.`,
    },
  ],
  entryFile: "src/index.tsx",
};
