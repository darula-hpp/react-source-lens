# React Source Lens

A React development tool that lets you inspect the source code of components by hovering and pressing `Cmd+Shift+O` (or `Ctrl+Shift+O` on Windows/Linux).

## Installation

```bash
npm install react-source-lens
```

## Usage

### 1. Import and use the hook

```jsx
import { useReactSourceLens } from 'react-source-lens';

// Basic usage
useReactSourceLens();

// With VS Code integration (recommended)
useReactSourceLens({
  projectRoot: '/path/to/your/project' // Absolute path to your project root
});
```

### 2. Configure Babel plugin (optional, for better source detection)

Add the Babel plugin to your `.babelrc` or `babel.config.js`:

```json
{
  "plugins": [
    "react-source-lens/babel-plugin"
  ]
}
```

Or in JavaScript config:

```js
module.exports = {
  plugins: [
    'react-source-lens/babel-plugin'
  ]
};
```

### 3. Usage in development

1. The overlay will be **visible by default** when the hook is active
2. **Hover** over any React component in your app
3. **Press** `Cmd+Shift+O` (Mac) or `Ctrl+Shift+O` (Windows/Linux) to inspect source location
4. **Press** `Cmd+Shift+L` (Mac) or `Ctrl+Shift+L` (Windows/Linux) to **toggle the overlay on/off**

When source information is found, a **modal popup** will appear with:
- **File and line number** information
- **"Open in VS Code"** button to jump directly to the component in your editor
- **"Copy Path"** button to copy the file path to clipboard
- **Close button** (×) or press **Escape** to dismiss

The modal automatically disappears after 10 seconds.

## How it works

React Source Lens uses React's internal fiber nodes and debug information to locate the source code of components. It works best when:

- React is in development mode
- Components have debug source information (enabled by default in Create React App and Vite)
- The Babel plugin is configured to add source attributes to JSX elements

## API

### `useReactSourceLens(options?)`

A React hook that enables source code inspection for the current React tree. Call this once at the root of your app in development mode.

#### Options

- `projectRoot?: string` - Absolute path to your project root directory. Required for VS Code integration to work properly. Example: `'/Users/username/projects/my-app'`

#### Example

```jsx
// Without VS Code integration
useReactSourceLens();

// With VS Code integration
useReactSourceLens({
  projectRoot: '/Users/username/projects/my-app'
});
```

## License

MIT
