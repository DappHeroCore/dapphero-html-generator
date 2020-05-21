const { getEntireHtml, createCodesandbox } = require('../dist/bundle');

module.exports = (req, res) => {
  try {
    const { abi, contractName } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!contractName) {
      return res.status(400).send({ message: 'Contract name not defined' });
    }

    if (!abi) {
      return res.status(400).send({ message: 'ABI not defined' });
    }

    if (!Array.isArray(abi)) {
      return res.status(422).send({ message: 'Invalid ABI' });
    }

    const html = getEntireHtml(abi, contractName);
    const codesandbox = createCodesandbox(html, contractName);

    res.status(200).send({ html, codesandbox });
  } catch (error) {
    res.status(500).send({ error: error.message, message: 'Ups! Internal error' });
  }
};
