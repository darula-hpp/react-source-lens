This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## React Source Lens - Next.js Demo

This demo shows how to use React Source Lens with Next.js.

## Setup

1. Make sure you have Node.js installed
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Usage

1. Open http://localhost:3000 in your browser
2. Hover over any component (cards, buttons)
3. Press `Cmd+Shift+O` (Mac) or `Ctrl+Shift+O` (Windows/Linux) to inspect source
4. A modal will appear showing the component's source location

## Configuration

The key configuration is in `.babelrc`:

```json
{
  "presets": ["next/babel"],
  "plugins": ["react-source-lens/babel-plugin"]
}
```

And in `components/ReactSourceLensProvider.tsx`:

```tsx
useReactSourceLens({
  projectRoot: '/Users/olebogengmbedzi/dev/react-source-lens/demo-next',
  editor: 'windsurf' // Configure your preferred editor
});
```

### Supported Editors

You can configure React Source Lens to open files in your preferred editor:
- `'vscode'` (default)
- `'webstorm'` / `'intellij'`
- `'atom'`
- `'sublime'`
- `'cursor'`
- `'windsurf'` ✨ **(new!)**

Or omit the `editor` option to auto-detect based on your environment variables (`REACT_EDITOR` or `EDITOR`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
