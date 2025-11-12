import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          'react-source-lens/babel-plugin'
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
});
