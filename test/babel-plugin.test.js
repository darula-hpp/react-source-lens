import { describe, it, expect } from 'vitest';
import { transform } from '@babel/core';
import babelPlugin from '../babel-source-plugin.cjs';

describe('babel-source-plugin', () => {
  it('should add data attributes to JSX elements', () => {
    const code = `
      function MyComponent() {
        return <div>Hello World</div>;
      }
    `;

    const result = transform(code, {
      plugins: [babelPlugin],
      presets: ['@babel/preset-react'],
      filename: '/test/Component.jsx',
    });

    expect(result.code).toContain('"data-source-file": "Component.jsx"');
    expect(result.code).toContain('"data-source-line": "3"');
  });

  it('should handle TypeScript files', () => {
    const code = `
      function MyComponent(): JSX.Element {
        return <div>Hello World</div>;
      }
    `;

    const result = transform(code, {
      plugins: [babelPlugin],
      presets: ['@babel/preset-react', '@babel/preset-typescript'],
      filename: '/test/Component.tsx',
    });

    expect(result.code).toContain('"data-source-file": "Component.tsx"');
    expect(result.code).toContain('"data-source-line": "3"');
  });

  it('should handle nested JSX elements', () => {
    const code = `
      function MyComponent() {
        return (
          <div>
            <span>Hello</span>
            <span>World</span>
          </div>
        );
      }
    `;

    const result = transform(code, {
      plugins: [babelPlugin],
      presets: ['@babel/preset-react'],
      filename: '/test/Component.jsx',
    });

    expect(result.code).toContain('"data-source-file": "Component.jsx"');
    // Should have line numbers for different elements
    expect(result.code).toMatch(/"data-source-line": "\d+"/);
  });

  it('should not add attributes to non-JSX elements', () => {
    const code = `
      function regularFunction() {
        return "hello";
      }
    `;

    const result = transform(code, {
      plugins: [babelPlugin],
      presets: ['@babel/preset-react'],
      filename: '/test/Component.jsx',
    });

    expect(result.code).not.toContain('data-source-file');
    expect(result.code).not.toContain('data-source-line');
  });

  it('should extract relative path from /src/ directory', () => {
    const code = `
      function MyComponent() {
        return <div>Hello World</div>;
      }
    `;

    const result = transform(code, {
      plugins: [babelPlugin],
      presets: ['@babel/preset-react'],
      filename: '/project/src/components/Component.jsx',
    });

    expect(result.code).toContain('"data-source-file": "src/components/Component.jsx"');
    expect(result.code).toContain('"data-source-line": "3"');
  });

  it('should extract relative path from /app/ directory (Next.js App Router)', () => {
    const code = `
      function MyComponent() {
        return <div>Hello World</div>;
      }
    `;

    const result = transform(code, {
      plugins: [babelPlugin],
      presets: ['@babel/preset-react'],
      filename: '/project/app/components/Button.tsx',
    });

    expect(result.code).toContain('"data-source-file": "app/components/Button.tsx"');
    expect(result.code).toContain('"data-source-line": "3"');
  });

  it('should extract relative path from /components/ directory', () => {
    const code = `
      function MyComponent() {
        return <div>Hello World</div>;
      }
    `;

    const result = transform(code, {
      plugins: [babelPlugin],
      presets: ['@babel/preset-react'],
      filename: '/project/components/Button.tsx',
    });

    expect(result.code).toContain('"data-source-file": "components/Button.tsx"');
    expect(result.code).toContain('"data-source-line": "3"');
  });
});
