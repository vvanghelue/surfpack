export const vanillaJsTodoApp = {
  templateName: "Vanilla JS Todo App",
  description: "A clean todo application built with pure JavaScript",
  files: [
    {
      path: "package.json",
      content: `{
  "name": "vanilla-todo-demo",
  "version": "1.0.0",
  "type": "module"
}`,
    },
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vanilla JS Todo Demo</title>
    <link rel="stylesheet" href="src/style.css" />
  </head>
  <body>
    <div class="app">
      <div class="header">
        <h1>📋 Pure JS Todo</h1>
        <p>No frameworks, just vanilla JavaScript!</p>
      </div>

      <div class="todo-form">
        <input type="text" id="todo-input" placeholder="Add a new todo..." />
        <button id="add-btn">Add Todo</button>
      </div>

      <div class="filters">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="active">Active</button>
        <button class="filter-btn" data-filter="completed">Completed</button>
      </div>

      <div id="todo-list" class="todo-list"></div>

      <div id="stats" class="stats"></div>
    </div>

    <script src="src/app.js"></script>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: linear-gradient(135deg, #667eea, #764ba2);
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
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #eee;
}

#todo-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

#todo-input:focus {
  border-color: #667eea;
}

#add-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s ease;
}

#add-btn:hover {
  transform: translateY(-1px);
}

#add-btn:disabled {
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
  background: #667eea;
  color: white;
  border-color: #667eea;
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
  border: 2px solid #667eea;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.todo-checkbox.checked {
  background: #667eea;
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
  transition: all 0.2s ease;
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
  display: block;
}

.stats {
  padding: 20px;
  background: #f8f9fa;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.slide-in {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-out {
  animation: slideOut 0.3s ease forwards;
}

@keyframes slideOut {
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}`,
    },
    {
      path: "src/app.js",
      content: `class TodoApp {
  constructor() {
    this.todos = this.loadTodos();
    this.filter = 'all';
    this.initElements();
    this.bindEvents();
    this.render();
  }

  initElements() {
    this.todoInput = document.getElementById('todo-input');
    this.addBtn = document.getElementById('add-btn');
    this.todoList = document.getElementById('todo-list');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.statsElement = document.getElementById('stats');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addTodo());
    this.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });
    this.todoInput.addEventListener('input', () => this.updateAddButton());
    
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });
  }

  loadTodos() {
    const saved = localStorage.getItem('vanilla-todos');
    return saved ? JSON.parse(saved) : [];
  }

  saveTodos() {
    localStorage.setItem('vanilla-todos', JSON.stringify(this.todos));
  }

  addTodo() {
    const text = this.todoInput.value.trim();
    if (!text) return;

    const todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.unshift(todo);
    this.todoInput.value = '';
    this.updateAddButton();
    this.saveTodos();
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  }

  deleteTodo(id) {
    const todoElement = document.querySelector(\`[data-id="\${id}"]\`);
    if (todoElement) {
      todoElement.classList.add('slide-out');
      setTimeout(() => {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
      }, 300);
    }
  }

  setFilter(filter) {
    this.filter = filter;
    this.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.render();
  }

  getFilteredTodos() {
    return this.todos.filter(todo => {
      if (this.filter === 'active') return !todo.completed;
      if (this.filter === 'completed') return todo.completed;
      return true;
    });
  }

  updateAddButton() {
    this.addBtn.disabled = !this.todoInput.value.trim();
  }

  createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = \`todo-item \${todo.completed ? 'completed' : ''} slide-in\`;
    div.dataset.id = todo.id;
    
    div.innerHTML = \`
      <div class="todo-checkbox \${todo.completed ? 'checked' : ''}" 
           onclick="app.toggleTodo('\${todo.id}')"></div>
      <span class="todo-text \${todo.completed ? 'completed' : ''}">\${todo.text}</span>
      <button class="delete-btn" onclick="app.deleteTodo('\${todo.id}')">Delete</button>
    \`;
    
    return div;
  }

  renderEmptyState() {
    const div = document.createElement('div');
    div.className = 'empty-state';
    
    let emoji, message;
    if (this.filter === 'completed') {
      emoji = '🎉';
      message = 'No completed todos yet!';
    } else if (this.filter === 'active') {
      emoji = '✨';
      message = 'No active todos. Great job!';
    } else {
      emoji = '🌟';
      message = 'No todos yet. Add one above!';
    }
    
    div.innerHTML = \`
      <span class="emoji">\${emoji}</span>
      <p>\${message}</p>
    \`;
    
    return div;
  }

  renderStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const active = total - completed;
    
    if (total === 0) {
      this.statsElement.textContent = '';
      return;
    }
    
    this.statsElement.textContent = \`\${active} active • \${completed} completed • \${total} total\`;
  }

  render() {
    const filteredTodos = this.getFilteredTodos();
    this.todoList.innerHTML = '';
    
    if (filteredTodos.length === 0) {
      this.todoList.appendChild(this.renderEmptyState());
    } else {
      filteredTodos.forEach(todo => {
        this.todoList.appendChild(this.createTodoElement(todo));
      });
    }
    
    this.renderStats();
    this.updateAddButton();
  }
}

// Initialize the app
const app = new TodoApp();

// Make app globally available for event handlers
window.app = app;`,
    },
  ],
  entryFile: "index.html",
};
