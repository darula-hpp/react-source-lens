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

### Next.js Compatibility

**⚠️ Next.js requires additional configuration** because it uses its own webpack and babel setup.

To use React Source Lens with Next.js:

1. **Install the package and required dependencies** in your Next.js project:
   ```bash
   npm install react-source-lens babel-loader @babel/core @babel/preset-env @babel/preset-typescript
   ```

2. **Configure Next.js to use the babel plugin** by creating/editing `next.config.js` (CommonJS) or `next.config.mjs` (ESM):

   **For CommonJS (`next.config.js`):**
   ```javascript
   module.exports = {
     experimental: {
       swcPlugins: [] // Disable SWC to use Babel
     },
     webpack: (config, { dev }) => {
       if (dev) {
         config.module.rules.push({
           test: /\.(js|jsx|ts|tsx)$/,
           use: {
             loader: 'babel-loader',
             options: {
               plugins: [
                 'react-source-lens/babel-plugin'
               ],
               presets: [
                 '@babel/preset-env',
                 ['@babel/preset-react', { development: true }],
                 '@babel/preset-typescript'
               ]
             }
           },
           exclude: /node_modules/
         });
       }
       return config;
     }
   };
   ```

   **For ESM (`next.config.mjs`):**
   ```javascript
   export default {
     experimental: {
       swcPlugins: [] // Disable SWC to use Babel
     },
     webpack: (config, { dev }) => {
       if (dev) {
         config.module.rules.push({
           test: /\.(js|jsx|ts|tsx)$/,
           use: {
             loader: 'babel-loader',
             options: {
               plugins: [
                 'react-source-lens/babel-plugin'
               ],
               presets: [
                 '@babel/preset-env',
                 ['@babel/preset-react', { development: true }],
                 '@babel/preset-typescript'
               ]
             }
           },
           exclude: /node_modules/
         });
       }
       return config;
     }
   };
   ```

3. **Use the hook in your app** (e.g., in `_app.js`):
   ```jsx
   import { useReactSourceLens } from 'react-source-lens';

   function MyApp({ Component, pageProps }) {
     // Only in development
     if (process.env.NODE_ENV === 'development') {
       useReactSourceLens({
         projectRoot: '/absolute/path/to/your/nextjs/project'
       });
     }

     return <Component {...pageProps} />;
   }

   export default MyApp;
   ```

**Note**: Next.js uses SWC by default, which doesn't support custom babel plugins. The configuration above switches to Babel for development builds.

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
