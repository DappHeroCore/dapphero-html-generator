const { getHtmlPiecesFromViewMethods, getHtmlPiecesFromTransactionMethods } = require('../dist/bundle');

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

    const viewMethodsHtml = getHtmlPiecesFromViewMethods(abi, contractName);
    const transactionMethodsHtml = getHtmlPiecesFromTransactionMethods(abi, contractName);

    res.status(200).send({ viewMethodsHtml, transactionMethodsHtml });
  } catch (error) {
    res.status(500).send({ error: error.message, message: 'Ups! Internal error' });
  }
};
