const fetch = require('node-fetch');

const createCodesandbox = async (html) => {
  const body = JSON.stringify({
    files: {
      'index.html': { content: html },
      'package.json': { content: { dependencies: {} } },
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
