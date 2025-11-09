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
          const sourceFile = this.filename.split('/src/')[1] || this.filename.split('/').pop();
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
