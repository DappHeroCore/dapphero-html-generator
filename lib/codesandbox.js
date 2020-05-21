const { getParameters } = require('codesandbox/lib/api/define');

const { createHtmlTemplate } = require('./html');

const createCodesandbox = (html, contractName) => {
  const parameters = getParameters({
    files: {
      'index.html': {
        isBinary: false,
        content: createHtmlTemplate(html, contractName),
      },
      'package.json': {
        content: { dependencies: {} },
      },
    },
  });

  const url = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`;

  return url;
};

module.exports = { createCodesandbox };
