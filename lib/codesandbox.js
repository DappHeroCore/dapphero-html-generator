const fetch = require('node-fetch');

const createCodesandbox = async (html) => {
  const body = JSON.stringify({
    files: {
      'index.html': { content: html },
      'package.json': {
        content: {
          name: 'dapphero-html',
          version: '1.0.0',
          description: 'DappHero example starter project',
          main: 'index.html',
          scripts: {
            start: 'parcel index.html --open',
            build: 'parcel build index.html',
          },
          devDependencies: {
            '@babel/core': '7.2.0',
            'parcel-bundler': '^1.6.1',
          },
        },
      },
    },
  });

  const response = await fetch('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
    body,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });
  const { sandbox_id } = await response.json();

  return `https://codesandbox.io/s/${sandbox_id}`;
};

module.exports = { createCodesandbox };
