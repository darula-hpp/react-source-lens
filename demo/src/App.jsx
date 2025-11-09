import React from 'react';
import { useReactSourceLens } from 'react-source-lens';
import TestComponent from './components/TestComponent';

function InnerTestComponent() {
  return (
    <div style={{ padding: '20px', border: '2px solid blue', margin: '10px' }}>
      <h2>Test Component</h2>
      <p>This is a test component to inspect with React Source Lens</p>
      <button onClick={() => alert('Button clicked!')}>Click me</button>
    </div>
  );
}

function AnotherComponent({ children }) {
  return (
    <div style={{ padding: '20px', border: '2px solid green', margin: '10px' }}>
      <h3>Another Component</h3>
      {children}
    </div>
  );
}

function App() {
  // Enable React Source Lens in development
  if (process.env.NODE_ENV === 'development') {
    useReactSourceLens();
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>React Source Lens Demo</h1>
      <p>Hover over components and press <strong>Cmd+Shift+O</strong> (Mac) or <strong>Ctrl+Shift+O</strong> (Windows/Linux) to see their source location.</p>

      <InnerTestComponent />

      <AnotherComponent>
        <p>This is nested content</p>
        <span>More nested content</span>
      </AnotherComponent>

      <TestComponent />
    </div>
  );
}

export default App;
