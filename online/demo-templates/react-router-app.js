export const reactRouterApp = {
  templateName: "React Router App",
  description: "Multi-page application with React Router navigation",
  files: [
    {
      path: "package.json",
      content: `{
  "name": "react-router-demo",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "react-router-dom": "^6"
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
    <title>React Router Demo</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    },
    {
      path: "src/style.css",
      content: `* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Navigation */
.navbar {
  background: white;
  border-radius: 15px;
  padding: 20px 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 10px;
}

.navbar-nav {
  display: flex;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  padding: 10px 20px;
  text-decoration: none;
  color: #4a5568;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: #f7fafc;
  color: #667eea;
}

.nav-link.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

/* Content */
.content {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.page-title {
  font-size: 2.5rem;
  margin: 0 0 20px;
  color: #2d3748;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #718096;
  margin-bottom: 30px;
}

/* Home Page */
.hero {
  text-align: center;
  padding: 60px 0;
}

.hero-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.feature-card {
  padding: 30px;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.feature-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
}

.feature-description {
  color: #718096;
  line-height: 1.6;
}

/* About Page */
.team-section {
  margin-top: 40px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.team-member {
  text-align: center;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
}

.team-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 15px;
}

.team-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
}

.team-role {
  color: #718096;
  font-size: 0.9rem;
}

/* Contact Page */
.contact-form {
  max-width: 600px;
  margin: 40px auto 0;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.success-message {
  background: #c6f6d5;
  color: #22543d;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
}

/* 404 Page */
.error-page {
  text-align: center;
  padding: 60px 0;
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

.error-code {
  font-size: 6rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
}

.home-link {
  display: inline-block;
  margin-top: 30px;
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.home-link:hover {
  transform: translateY(-2px);
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
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from "react-router-dom";
import Home from "./pages/Home.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">
            🏄‍♂️ Surfpack Router
          </div>
          <ul className="navbar-nav">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => \`nav-link \${isActive ? 'active' : ''}\`}
                end
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/about" 
                className={({ isActive }) => \`nav-link \${isActive ? 'active' : ''}\`}
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/contact" 
                className={({ isActive }) => \`nav-link \${isActive ? 'active' : ''}\`}
              >
                Contact
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}`,
    },
    {
      path: "src/pages/Home.tsx",
      content: `import React from "react";

export default function Home() {
  return (
    <div className="hero">
      <div className="hero-icon">🏠</div>
      <h1 className="page-title">Welcome to Surfpack</h1>
      <p className="page-subtitle">
        A powerful browser-based bundler with React Router integration
      </p>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3 className="feature-title">Lightning Fast</h3>
          <p className="feature-description">
            Bundle your code instantly in the browser with no build step required.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎨</div>
          <h3 className="feature-title">Beautiful UI</h3>
          <p className="feature-description">
            Modern, responsive interface with code editor and live preview.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3 className="feature-title">Easy to Use</h3>
          <p className="feature-description">
            Start coding immediately with zero configuration needed.
          </p>
        </div>
      </div>
    </div>
  );
}`,
    },
    {
      path: "src/pages/About.tsx",
      content: `import React from "react";

export default function About() {
  return (
    <div>
      <h1 className="page-title">About Surfpack</h1>
      <p className="page-subtitle">
        Built with modern web technologies
      </p>

      <div style={{ lineHeight: 1.8, color: '#4a5568' }}>
        <p>
          Surfpack is a browser-based bundler that allows you to write and run modern JavaScript
          applications directly in your browser. No installation, no build tools, no configuration.
        </p>
        <p>
          It supports React, TypeScript, CSS modules, and more out of the box. Perfect for
          prototyping, learning, or sharing code examples.
        </p>
      </div>

      <div className="team-section">
        <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>Our Team</h2>
        <p style={{ color: '#718096', marginBottom: '30px' }}>
          Meet the people behind Surfpack
        </p>

        <div className="team-grid">
          <div className="team-member">
            <div className="team-avatar">👨‍💻</div>
            <div className="team-name">Alex Johnson</div>
            <div className="team-role">Lead Developer</div>
          </div>

          <div className="team-member">
            <div className="team-avatar">👩‍🎨</div>
            <div className="team-name">Sarah Chen</div>
            <div className="team-role">UI/UX Designer</div>
          </div>

          <div className="team-member">
            <div className="team-avatar">👨‍🔬</div>
            <div className="team-name">Mike Wilson</div>
            <div className="team-role">Tech Lead</div>
          </div>

          <div className="team-member">
            <div className="team-avatar">👩‍💼</div>
            <div className="team-name">Emma Davis</div>
            <div className="team-role">Product Manager</div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    },
    {
      path: "src/pages/Contact.tsx",
      content: `import React, { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const isFormValid = formData.name && formData.email && formData.message;

  return (
    <div>
      <h1 className="page-title">Get in Touch</h1>
      <p className="page-subtitle">
        We'd love to hear from you! Send us a message.
      </p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us what's on your mind..."
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={!isFormValid}
        >
          Send Message
        </button>

        {submitted && (
          <div className="success-message">
            ✅ Thank you! Your message has been sent successfully.
          </div>
        )}
      </form>
    </div>
  );
}`,
    },
    {
      path: "src/pages/NotFound.tsx",
      content: `import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="error-page">
      <div className="error-icon">🔍</div>
      <div className="error-code">404</div>
      <h1 className="page-title">Page Not Found</h1>
      <p className="page-subtitle">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="home-link">
        Go Back Home
      </Link>
    </div>
  );
}`,
    },
  ],
  entryFile: "src/index.tsx",
};
