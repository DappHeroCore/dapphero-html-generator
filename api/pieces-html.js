const { getHtmlPiecesFromViewMethods, getHtmlPiecesFromTransactionMethods } = require('../dist/bundle');

module.exports = (req, res) => {
  try {
    const { abi, contractName } = req.body;
    const ABI = JSON.parse(abi);

    if (!contractName) {
      return res.status(400).send({ message: 'Contract name not defined' });
    }

    if (!ABI) {
      return res.status(400).send({ message: 'ABI not defined' });
    }

    if (!Array.isArray(ABI)) {
      return res.status(422).send({ message: 'Invalid ABI' });
    }

    const viewMethodsHtml = getHtmlPiecesFromViewMethods(ABI, contractName);
    const transactionMethodsHtml = getHtmlPiecesFromTransactionMethods(ABI, contractName);

    res.status(200).send({ viewMethodsHtml, transactionMethodsHtml });
  } catch (error) {
    res.status(500).send({ error: error.message, message: 'Ups! Internal error' });
  }
};
