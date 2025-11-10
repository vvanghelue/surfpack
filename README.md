# Surfpack

> Run your JavaScript/TypeScript code directly in the browser with zero bundling.

Surfpack is a modern browser-based bundler that allows developers to write and run TypeScript/JavaScript code directly in the browser without complex build setups.

## 🚀 Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Quick Start

```bash
# Install dependencies
npm install

# Start development server with hot reloading
npm run dev

# Build for production
npm run build:prod
```

### 🛠️ Build System

Surfpack uses **Rolldown** (a fast Rust-based bundler) for building. The build system supports:

#### Development Mode

- **Dual entry points**: Main library + Playground
- **Hot reloading**: Instant rebuilds on file changes
- **Source maps**: Full debugging support
- **TypeScript**: Automatic type checking and declaration generation

#### Production Mode

- **Single entry point**: Only main library bundle
- **Optimized builds**: Minified and tree-shaken
- **No dev dependencies**: Clean production artifacts

### 📁 Project Structure

```
src/
├── index.ts                    # Main library entry point
├── bundler/                    # Core bundling logic
│   ├── bundle.ts
│   ├── bundler.ts
│   ├── dom.ts
│   └── ...
├── ui/                        # UI components
│   ├── code-editor.ts
│   ├── file-browser.ts
│   └── ui.ts
└── dev-playground/            # Development playground
    ├── playground.ts          # Playground entry point
    ├── playground.html
    └── code-templates/
```

### 🔧 Available Scripts

```bash
# Development
npm run dev          # Build + watch + serve (dual entry points)
npm run dev-watch    # Watch mode only
npm run dev-serve    # Static server only

# Building
npm run build        # Development build (includes playground)
npm run build:prod   # Production build (main library only)
npm run build:analyze # Bundle analysis

# Type checking
npm run types        # TypeScript type checking only
```

### 🔄 Development Workflow

1. **Start development server**:

   ```bash
   npm run dev
   ```

   This will:
   - Build both main library (`dist/index.js`) and playground (`dist/playground.js`)
   - Start watching for file changes
   - Serve files at `http://localhost:5101`

2. **Main library development**:
   - Edit files in `src/` (excluding `src/dev-playground/`)
   - Changes trigger automatic rebuilds of `dist/index.js`
   - TypeScript declarations are generated automatically

3. **Playground development**:
   - Edit files in `src/dev-playground/`
   - Changes trigger automatic rebuilds of `dist/playground.js`
   - Access playground at `http://localhost:5101/src/dev-playground/playground.html`

### 🎯 Entry Points

#### Main Library (`src/index.ts`)

- **Development**: `dist/index.js` + `dist/index.js.map`
- **Production**: `dist/index.js` (minified)
- **Types**: `dist/index.d.ts` + `dist/index.d.ts.map`

#### Playground (`src/dev-playground/playground.ts`)

- **Development only**: `dist/playground.js` + `dist/playground.js.map`
- **Not included in production builds**

### 🔍 Key Features

- **Zero Config**: Works out of the box with sensible defaults
- **Fast Rebuilds**: Rolldown provides sub-second rebuild times
- **TypeScript First**: Full TypeScript support with automatic declarations
- **Browser Native**: Outputs ES modules for modern browsers
- **Hot Reloading**: Instant feedback during development
- **Clean Production**: Playground code excluded from production bundles

### 📦 Build Output

#### Development Build

```
dist/
├── index.js           # Main library bundle
├── index.js.map       # Source map
├── playground.js      # Playground bundle
├── playground.js.map  # Source map
├── index.d.ts         # Type declarations
└── index.d.ts.map     # Declaration source map
```

#### Production Build

```
dist/
├── index.js           # Minified main bundle (no sourcemap)
├── index.d.ts         # Type declarations
└── index.d.ts.map     # Declaration source map
```

### 🚨 Troubleshooting

**Watch mode not working?**

- Ensure no other processes are using the files
- Try restarting with `npm run dev`

**TypeScript errors?**

- Run `npm run types` to check for type issues
- Ensure all imports are properly typed

**Build failures?**

- Clear `dist/` folder: `rm -rf dist`
- Reinstall dependencies: `npm ci`

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test: `npm run dev`
4. Ensure types are correct: `npm run types`
5. Build for production: `npm run build:prod`
6. Commit and push: `git commit -am "Add feature" && git push`
7. Create a Pull Request

---

Built with ❤️ using [Rolldown](https://rolldown.rs/)
