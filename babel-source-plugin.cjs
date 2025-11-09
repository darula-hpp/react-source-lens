const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api) => {
  api.assertVersion(7);

  const { types: t } = api;

  return {
    name: 'react-source-lens',
    visitor: {
      JSXOpeningElement(path) {
        // Get source info from Babel's source location
        const loc = path.node.loc;
        if (loc && loc.start) {
          // Extract relative path - check multiple directory structures
          let sourceFile;

          // First, try to extract from src/ directory (traditional React projects)
          const srcParts = this.filename.split('/src/');
          if (srcParts.length > 1) {
            sourceFile = 'src/' + srcParts[srcParts.length - 1];
          } else {
            // Then, try to extract from app/ directory (Next.js App Router)
            const appParts = this.filename.split('/app/');
            if (appParts.length > 1) {
              sourceFile = 'app/' + appParts[appParts.length - 1];
            } else {
              // Fallback: try to find a reasonable project root indicator
              const pathParts = this.filename.split('/');
              // Look for common project root directories and extract from there
              const rootIndicators = ['components', 'pages', 'app', 'src'];
              let foundRootIndex = -1;

              for (let i = pathParts.length - 1; i >= 0; i--) {
                if (rootIndicators.includes(pathParts[i])) {
                  foundRootIndex = i;
                  break;
                }
              }

              if (foundRootIndex !== -1) {
                sourceFile = pathParts.slice(foundRootIndex).join('/');
              } else {
                // Last resort: just use the filename
                sourceFile = this.filename.split('/').pop();
              }
            }
          }

          const sourceLine = loc.start.line.toString();

          // Add data attributes to the element
          const attributes = path.node.attributes;

          // Create JSXAttribute nodes for data-source-file and data-source-line
          attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier('data-source-file'),
              t.stringLiteral(sourceFile)
            )
          );
          attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier('data-source-line'),
              t.stringLiteral(sourceLine)
            )
          );
        }
      }
    }
  };
});
