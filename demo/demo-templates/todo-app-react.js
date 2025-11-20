export const todoAppReact = {
  templateName: "React Todo App",
  description: "A feature-rich todo application with local storage",
  files: [
    {
      path: "package.json",
      content: `{
  "name": "react-todo-demo",
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
    <title>React Todo Demo</title>
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
  padding: 20px;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  min-height: 100vh;
}

.app {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  padding: 30px;
  text-align: center;
  color: white;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 300;
}

.header p {
  margin: 10px 0 0;
  opacity: 0.9;
}

.todo-form {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.input-group {
  display: flex;
  gap: 10px;
}

input[type="text"] {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus {
  border-color: #6c5ce7;
}

.add-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.add-btn:hover {
  transform: translateY(-1px);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.filters {
  padding: 20px;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background: #6c5ce7;
  color: white;
  border-color: #6c5ce7;
}

.todo-list {
  min-height: 200px;
}

.todo-item {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: background-color 0.2s ease;
}

.todo-item:hover {
  background: #f8f9fa;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #6c5ce7;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}

.todo-checkbox.checked {
  background: #6c5ce7;
}

.todo-checkbox.checked::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.todo-text {
  flex: 1;
  font-size: 16px;
}

.todo-text.completed {
  text-decoration: line-through;
}

.delete-btn {
  background: #ff7675;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.delete-btn:hover {
  background: #e84393;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #6c757d;
}

.empty-state .emoji {
  font-size: 3rem;
  margin-bottom: 15px;
}

.stats {
  padding: 20px;
  background: #f8f9fa;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
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
      content: `import React, { useState, useEffect } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

type Filter = 'all' | 'active' | 'completed';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('react-todos');
    if (savedTodos) {
      const parsed = JSON.parse(savedTodos);
      setTodos(parsed.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      })));
    }
  }, []);

  // Save todos to localStorage when todos change
  useEffect(() => {
    localStorage.setItem('react-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTodos(prev => [newTodo, ...prev]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="app">
      <div className="header">
        <h1>📝 Todo App</h1>
        <p>Stay organized and get things done!</p>
      </div>

      <form className="todo-form" onSubmit={addTodo}>
        <div className="input-group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What needs to be done?"
          />
          <button 
            type="submit" 
            className="add-btn"
            disabled={!inputValue.trim()}
          >
            Add Todo
          </button>
        </div>
      </form>

      <div className="filters">
        <button 
          className={\`filter-btn \${filter === 'all' ? 'active' : ''}\`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={\`filter-btn \${filter === 'active' ? 'active' : ''}\`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={\`filter-btn \${filter === 'completed' ? 'active' : ''}\`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="todo-list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">
              {filter === 'completed' ? '🎉' : filter === 'active' ? '✨' : '🌟'}
            </div>
            <p>
              {filter === 'completed' 
                ? 'No completed todos yet!' 
                : filter === 'active'
                ? 'No active todos. Great job!'
                : 'No todos yet. Add one above!'}
            </p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <div 
              key={todo.id} 
              className={\`todo-item \${todo.completed ? 'completed' : ''}\`}
            >
              <div 
                className={\`todo-checkbox \${todo.completed ? 'checked' : ''}\`}
                onClick={() => toggleTodo(todo.id)}
              />
              <span className={\`todo-text \${todo.completed ? 'completed' : ''}\`}>
                {todo.text}
              </span>
              <button 
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {todos.length > 0 && (
        <div className="stats">
          {activeTodosCount} active • {completedTodosCount} completed • {todos.length} total
        </div>
      )}
    </div>
  );
}`,
    },
  ],
  entryFile: "src/index.tsx",
};
