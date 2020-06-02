const { getEntireHtml, createCodesandbox } = require('../dist/bundle');

module.exports = async (req, res) => {
  try {
    const { abis, projectId, projectNetworkId = '', projectNetworkName = '', projectDescription = '', projectImage = '', projectName = '' } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!projectId) {
      return res.status(400).send({ message: 'Project id not defined' });
    }
    if (!abis) {
      return res.status(400).send({ message: 'ABIs not defined' });
    }

    if (!Array.isArray(abis)) {
      return res.status(422).send({ message: 'Invalid ABI' });
    }

    const html = getEntireHtml({abis, projectId, projectNetworkId, projectNetworkName, projectDescription, projectImage, projectName});

    const codesandbox = await createCodesandbox(html);

    res.status(200).send({ html, codesandbox, abis });
  } catch (error) {
    const { abis } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    res.status(500).send({ error: error.message, message: 'Ups! Internal error', abis });
  }
};
