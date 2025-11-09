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

function App() {
  useReactSourceLens();

  return (
    <div>
      <h1>Hello World</h1>
      <MyComponent />
    </div>
  );
}
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
3. **Press** `Cmd+Shift+O` (Mac) or `Ctrl+Shift+O` (Windows/Linux) to see the source location
4. **Press** `Cmd+Shift+L` (Mac) or `Ctrl+Shift+L` (Windows/Linux) to **toggle the overlay on/off**

## How it works

React Source Lens uses React's internal fiber nodes and debug information to locate the source code of components. It works best when:

- React is in development mode
- Components have debug source information (enabled by default in Create React App and Vite)
- The Babel plugin is configured to add source attributes to JSX elements

## API

### `useReactSourceLens()`

A React hook that enables source code inspection for the current React tree. Call this once at the root of your app in development mode.

## License

MIT
