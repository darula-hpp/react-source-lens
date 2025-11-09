import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic', // Use automatic JSX runtime
      babel: {
        plugins: [
          [path.resolve('./babel-source-plugin.cjs')],
        ],
        presets: [
          [
            "@babel/preset-react",
            {
              development: true,
              runtime: "automatic",
            },
          ],
        ],
      },
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.js'),
      name: 'ReactSourceLens',
      formats: ['es', 'cjs'],
      fileName: (format) => `react-source-lens.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
