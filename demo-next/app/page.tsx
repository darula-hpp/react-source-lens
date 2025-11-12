import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          React Source Lens Demo
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Hover over components below and press <kbd className="px-2 py-1 bg-gray-200 rounded">Cmd+Shift+O</kbd> (Mac) or <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+Shift+O</kbd> (Windows/Linux) to inspect their source code.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Sample Card">
            <p className="text-gray-600">This is a sample card component.</p>
            <Button>Click me!</Button>
          </Card>

          <Card title="Another Card">
            <p className="text-gray-600">Another sample card with different content.</p>
            <Button variant="secondary">Secondary Button</Button>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Instructions</h2>
          <ul className="text-blue-800 space-y-1">
            <li>• Hover over any component (like the cards or buttons above)</li>
            <li>• Press <kbd className="px-1 py-0.5 bg-blue-200 rounded text-xs">Cmd+Shift+O</kbd> (Mac) or <kbd className="px-1 py-0.5 bg-blue-200 rounded text-xs">Alt+Shift+O</kbd> (Windows/Linux)</li>
            <li>• A modal will appear with file location and VS Code integration</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
