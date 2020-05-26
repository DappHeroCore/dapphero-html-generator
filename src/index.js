const prettier = require('prettier');
const chalk = require('chalk');
const log = console.log;

// lib
const { generateUniqueId } = require('../lib/id');
const { createHtmlTemplate } = require('../lib/html');
const { createCodesandbox } = require('../lib/codesandbox');
const { filterAnonymousMethods, getMethods, getViewMethods, getTransactionMethods } = require('../lib/abi');

// string helpers
const formatHtml = (string) => prettier.format(string, { parser: 'html' });

// html helpers
const getFeatureElement = (
  { name },
  { id = '', children = '', contractName = '', featureName = 'customContract', autoInvoke = 'false' },
) => `
  <div
    data-dh-feature="${featureName}"
    data-dh-property-method-id="${id}"
    data-dh-property-auto-invoke="${autoInvoke}"
    data-dh-property-contract-name="${contractName}"
    data-dh-property-method-name="${name}"
  >
    <h3>Method "${name}"</h3>
    ${children}
  </div>
`;

const getInputElement = ({ name = '', type }, { id = '' }) => `
  <input
    type="text"
    placeholder="Insert value with type ${type}"
    data-dh-property-method-id="${id}"
    data-dh-property-input-name="${name ? name : '$true'}"
  />
`;

const getOutputElement = ({ name = '' }, { id = '', index, isTransaction }) => {

  // log(chalk.red('Hello'))
  
return (`
  <div
    data-dh-property-method-id="${id}"
    ${isTransaction ? `data-dh-property-outputs="true"` : ''}
    ${!isTransaction && name ? `data-dh-property-output-name="${name}"` : `data-dh-property-outputs="true"`}
  >
    <pre>Output...</pre>
  </div>
`);}

  const getInvokeElement = ({ name = '' }, { id = '' }) => `
  <button
    data-dh-property-invoke="true"
    data-dh-property-method-id="${id}"
  >
    ${name}
  </button>
`;

  const getScriptTag = (projectId) => `
  <script
    id="dh-apiKey"
    data-api="${projectId}"
    src="https://package.dapphero.io/main.js"
  ></script>
  <link rel="stylesheet" href="https://unpkg.com/mvp.css" />
    <style>
      form {
        margin: 40px;
      }
    </style>
`;

  const getWeb3Tag = () => `
  <button
    data-dh-feature="network"
    data-dh-property-enable="true"
  >
    Enable Web3
  </button>
`;

  const getHtmlFromPieces = (pieces) => pieces.map(({ html }) => html).join('<hr/>');

  const getHtmlFromIO = (io) => io.reduce((acc, element) => `${acc}${element[element.key]}`, '');

  const generateHtmlPieces = (abi = [], contractName) => {
    return filterAnonymousMethods(abi).map((method) => {
      const id = generateUniqueId();
      const { inputs = [], outputs = [], name, stateMutability } = method;

      const isTransaction = (stateMutability !== 'view') && (stateMutability !== 'pure');
      const invoker = getInvokeElement(method, { id });

      const inputElements = inputs.map((input) => {
        const key = input.name;
        return { key, [key]: formatHtml(getInputElement(input, { id })) };
      });
      const outputElements = outputs.map((output, index) => {
        const key = output.name;
        return { key, [key]: formatHtml(getOutputElement(output, { id, isTransaction, index })) };
      });

      const autoInvoke = inputs.length === 0 ? 'true' : 'false';
      const children = formatHtml([...getHtmlFromIO(inputElements), ...getHtmlFromIO(outputElements), invoker].join(''));

      const featureElement = getFeatureElement(method, { id, children, autoInvoke, contractName });

      return {
        methodName: name,
        html: wrapIntoTags(featureElement),
        metadata: { inputs: inputElements, outputs: outputElements, invoke: invoker },
      };
    });
  };
  const wrapIntoTags = (html, wrapperTag = '', title = '') => {
    return wrapperTag ? `<${wrapperTag}>${title ? `<h2>${title}</h2>` : ''}${html}</${wrapperTag}>` : `${html}`;
  };

  // getters
  const getHtmlPiecesFromViewMethods = (abi, contractName) => {
    return abi |> getMethods |> getViewMethods |> ((abi) => generateHtmlPieces(abi, contractName));
  };

  const getHtmlPiecesFromTransactionMethods = (abi, contractName) => {
    return abi |> getMethods |> getTransactionMethods |> ((abi) => generateHtmlPieces(abi, contractName));
  };

  const getEntireHtml = (abis, projectId) => {
    const tags = abis
      .map(({ abi_text, name_text: contractName }) => {
        const abi = JSON.parse(abi_text);
        const htmlPiecesViewMethods = getHtmlPiecesFromViewMethods(abi, contractName);
        const htmlPiecesTransactionMethods = getHtmlPiecesFromTransactionMethods(abi, contractName);

        const viewMethodsHtml = getHtmlFromPieces(htmlPiecesViewMethods);

        const transactionMethodsHtml = getHtmlFromPieces(htmlPiecesTransactionMethods);

        const viewMethodsHtmlWrapped = wrapIntoTags(viewMethodsHtml, 'article', 'Public Methods');
        const transactionsMethodsHtmlWrapped = wrapIntoTags(transactionMethodsHtml, 'article', 'Transaction Methods');

        return wrapIntoTags(`${viewMethodsHtmlWrapped}${transactionsMethodsHtmlWrapped}`, 'section', contractName);
      })
      .join('\n');

    const web3Tag = getWeb3Tag();
    const scriptTag = getScriptTag(projectId);
    const html = createHtmlTemplate(`${web3Tag}${tags}${scriptTag}`);

    return formatHtml(html);
  };

  module.exports = {
    getEntireHtml,
    createCodesandbox,
    generateHtmlPieces,
    getHtmlPiecesFromViewMethods,
    getHtmlPiecesFromTransactionMethods,
  };

  // test
  // const { abi } = require('../mocks/abi');
  // const { abi } = require('../mocks/revertABI');
  // const contractName = "Test"
  // console.log(generateHtmlPieces(abi, 'a'));
  // console.log(
  //   JSON.stringify({
  //     abis: [
  //       { abi, contractName: 'wrapped-eth-1' },
  //       { abi, contractName: 'wrapped-eth-2' },
  //     ],
  //     projectId: '112233',
  //   }),
  // );
  // console.log([
  //   ...getHtmlPiecesFromViewMethods(abi, contractName),
  //   ...getHtmlPiecesFromTransactionMethods(abi, contractName),
  // ]);
// const {abis} = require('../mocks/abis')
// console.log(getEntireHtml(abi, 1234))