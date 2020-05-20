// lib
const { generateUniqueId } = require('../lib/id');
const { getMethods, getViewMethods, getTransactionMethods } = require('../lib/abi');

// string helpers
const formatHtml = (string) =>
  string
    .replace(/\n*/g, '')
    .replace(/>\s+</g, '><')
    .replace(/>\s+</g, '><')
    .replace(/\s{3}/g, '')
    .replace(/\s+>/g, '>');

// html helpers
const getFeatureElement = (
  { name },
  { id = '', children = '', contractName = '', featureName = 'customContract', autoInvoke = 'false' },
) => `
  <div
    data-dh-feature='${featureName}'
    data-dh-property-method-id='${id}'
    data-dh-property-auto-invoke='${autoInvoke}'
    data-dh-property-contract-name='${contractName}'
    data-dh-property-method-name='${name ? name : 'anonymous'}'
  >
    <h3>Method '${name ? name : 'anonymous'}'</h3>
    ${children}
  </div>
`;

const getInputElement = ({ name = '', type }, { id = '' }) => `
  <input
    type='text'
    placeholder='Insert value with type ${type}'
    data-dh-property-method-id='${id}'
    data-dh-property-input-name='${name}'
  />
`;

const getOutputElement = ({ name = '' }, { id = '', index = '' }) => `
  <div
    data-dh-property-outputs='true'
    data-dh-property-method-id='${id}'
    data-dh-property-output-name='${name || index}'
  >
    <pre>Output...</pre>
  </div>
`;

const getInvokeElement = ({ name = '' }, { id = '' }) => `
  <button
    data-dh-property-method-id='${id}'
    data-dh-property-invoke='true'
  >
    ${name ? name : 'anonymous'}
  </button>
`;

const getHtmlFromPieces = (pieces) => pieces.map(({ html }) => html).join('</hr>');
const getHtmlFromIO = (io) => io.reduce((acc, element) => `${acc}${element[element.key]}`, '');

const generateHtmlPieces = (abi = [], contractName) =>
  abi.map((method) => {
    const id = generateUniqueId();
    const { inputs = [], outputs = [] } = method;

    const invoker = getInvokeElement(method, { id });

    const inputElements = inputs.map((input) => {
      const key = input.name ? input.name : 'anonymous';
      return { key, [key]: formatHtml(getInputElement(input, { id })) };
    });
    const outputElements = outputs.map((output, index) => {
      const key = output.name ? output.name : 'anonymous';
      return { key, [key]: formatHtml(getOutputElement(output, { id, index })) };
    });

    const autoInvoke = inputs.length === 0 ? 'true' : 'false';
    const children = formatHtml([...getHtmlFromIO(inputElements), ...getHtmlFromIO(outputElements), invoker].join(''));

    const featureElement = getFeatureElement(method, { id, children, autoInvoke, contractName });

    return { html: wrapIntoTags(featureElement), inputs: inputElements, outputs: outputElements, invoke: invoker };
  });

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

const getAllHtmlPieces = (abi, contractName) => [
  ...getHtmlPiecesFromViewMethods(abi, contractName),
  ...getHtmlPiecesFromTransactionMethods(abi, contractName),
];

const getEntireHtml = (abi, contractName) => {
  const htmlPiecesViewMethods = getHtmlPiecesFromViewMethods(abi, contractName);
  const htmlPiecesTransactionMethods = getHtmlPiecesFromTransactionMethods(abi, contractName);

  const viewMethodsHtml = getHtmlFromPieces(htmlPiecesViewMethods);
  const transactionMethodsHtml = getHtmlFromPieces(htmlPiecesTransactionMethods);

  const viewMethodsHtmlWrapped = wrapIntoTags(viewMethodsHtml, 'section', 'Public Methods');
  const transactionsMethodsHtmlWrapped = wrapIntoTags(transactionMethodsHtml, 'section', 'Transaction Methods');

  return formatHtml(wrapIntoTags(`${viewMethodsHtmlWrapped}${transactionsMethodsHtmlWrapped}`, 'main', contractName));
};

module.exports = { getEntireHtml, getAllHtmlPieces, getHtmlPiecesFromViewMethods, getHtmlPiecesFromTransactionMethods };

// test
// const { abi } = require('../mocks/abi');
// const contractName = 'wrapped-eth';
// console.log(getEntireHtml(abi, contractName));
// console.log([
//   ...getHtmlPiecesFromViewMethods(abi, contractName),
//   ...getHtmlPiecesFromTransactionMethods(abi, contractName),
// ]);
