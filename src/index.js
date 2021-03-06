const prettier = require('prettier');
const chalk = require('chalk');

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
	<header>
	  <div
	    data-dh-feature="${featureName}"
	    data-dh-property-method-id="${id}"
	    data-dh-property-auto-invoke="${autoInvoke}"
	    data-dh-property-contract-name="${contractName}"
	    data-dh-property-method-name="${name}"
	  >
	    <h3>Method <mark>"${name}"</mark></h3>
	    <section><aside>${children}</aside></section>
	  </div>
  	</header>
`;

const getInputElement = ({ name = '', type }, { id = '', key, hasMoreThanOneAnonymousInput }) => {

  const getInputName = () => {
    let inputName = name
    if (!name) inputName = '$true'
    if (hasMoreThanOneAnonymousInput) inputName = `[${key}]`
    return inputName
  }

  return (`
<section>
Input name: <i>${name ? name : "anonymous input"}</i>
  <input
    type="text"
    placeholder="${type}"
    data-dh-property-method-id="${id}"
    data-dh-property-input-name="${getInputName()}"
  />
  </section>
`)
};

const getOutputElement = ({ name = '' }, { id = '', index, isTransaction }) => {

  return (`
  <div
    data-dh-property-method-id="${id}"
    ${isTransaction ? `data-dh-property-outputs="true"` : ''}
    ${!isTransaction && name ? `data-dh-property-output-name="${name}"` : `data-dh-property-outputs="true"`}
  >
    <pre>Output...</pre>
  </div>
`);
}

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
    <style>
      form {
        margin: 40px;
      }
    </style>
`;

const getHeaderTag = (projectDescription, projectImage, projectName) => `
<header>
  <nav>
      <img alt="Logo" src="${projectImage ? projectImage : "https://dd7tel2830j4w.cloudfront.net/f1588198682293x257424398827881060/Artboard%201.svg"}" height="70">
      <ul>
          <li>Menu Item 1</li>  
          <li><a href="#">Menu Item 2</a></li>
          <li><a href="#">Dropdown Menu Item</a>
              <ul>
                  <li><a href="#">Sublink with a long name</a></li>
                  <li><a href="#">Short sublink</a></li>
              </ul>
          </li>
      </ul>
  </nav>
  <h1>${projectName ? projectName : "My Sample Project"}</h1>
  <p>
    <mark>
      Powered by <a href="https://www.dapphero.io">DappHero.io</a>
    </mark>
  </p>
  <p>${projectDescription ? projectDescription : "My sample project description"}</p>
  <br>
  <p>
    <button data-dh-feature="network" data-dh-property-enable="true">
      Enable Web3
    </button>
  </p>
</header>`

const getWeb3Tag = () => `
  <button data-dh-feature="network" data-dh-property-enable="true">
    Enable Web3
  </button>
`;

const getCustomJavascriptTag = (networkId, networkName) => `
<script>
  document.addEventListener(
    "dappHeroConfigLoaded",
    ({ detail: dappHero }) => {
      // Inside here you can listen to any event you want
      console.log("DappHero Has Loaded!");

      // For projects with auto-invoked method, you will want to filter on events
      // dappHero.listenToTransactionStatusChange(data => {
      //   console.log("Listening to transtaction status change", data);
      // });

      // This is how you can listen to any events your smart contract emits
      dappHero.listenToSmartContractBlockchainEvent(data => {
        console.log("The blockChain Events: ", data)
      })

      
      ${networkId && networkName ? `
      //This is an example method for alerting your users they are on the wrong network
      //if(window.dappHero.provider.chainId !== ${networkId}){
      //  alert("Wrong network! You should be on ${networkName}")
      //}` :
      ""}
    });
</script>`

const getHtmlFromPieces = (pieces) => pieces.map(({ html }) => html);

const getHtmlFromIO = (io) => io.reduce((acc, element) => `${acc}${element[element.key]}`, '');

const generateHtmlPieces = (abi = [], contractName) => {
  return filterAnonymousMethods(abi).map((method) => {
    const id = generateUniqueId();
    const { inputs = [], outputs = [], name, stateMutability } = method;

    const isTransaction = (stateMutability !== 'view') && (stateMutability !== 'pure');
    const isPayable = (stateMutability === 'payable')
    const invoker = getInvokeElement(method, { id });

    // if(name === "deposit") console.log("Name: ", name, " Inputs: ", inputs, " state: ", stateMutability)

    const isPayable = stateMutability === "payable";
    const newInputs = [...newInputs, ...(isPayable ? [{ name: 'EthValue', type: 'EthValue', payable: 'true' }] : [])];

    const hasMoreThanOneAnonymousInput = newInputs.map(({ name }) => name).filter((name) => name === '').length > 1

    const inputElements = newInputs.map((input, index) => {
      const key = input.name || index

      return { key, [key]: formatHtml(getInputElement(input, { id, key, hasMoreThanOneAnonymousInput })) };
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
  return wrapperTag ? `<${wrapperTag}>${title ? `<section><h2>${title}</h2></section>` : ''}${html}</${wrapperTag}>` : `${html}`;
};

// getters
const getHtmlPiecesFromViewMethods = (abi, contractName) => {
  return abi |> getMethods |> getViewMethods |> ((abi) => generateHtmlPieces(abi, contractName));
};

const getHtmlPiecesFromTransactionMethods = (abi, contractName) => {
  return abi |> getMethods |> getTransactionMethods |> ((abi) => generateHtmlPieces(abi, contractName));
};

const getEntireHtml = ({ abis, projectId, projectDescription, projectImage, projectName, projectNetworkId, projectNetworkName }) => {
  const tags = abis
    .map(({ abi_text, name_text: contractName }) => {
      const abi = JSON.parse(abi_text);
      const htmlPiecesViewMethods = getHtmlPiecesFromViewMethods(abi, contractName);
      const htmlPiecesTransactionMethods = getHtmlPiecesFromTransactionMethods(abi, contractName);

      const viewMethodsHtml = getHtmlFromPieces(htmlPiecesViewMethods);

      const transactionMethodsHtml = getHtmlFromPieces(htmlPiecesTransactionMethods);

      const viewMethodsHtmlWrapped = wrapIntoTags(wrapIntoTags(viewMethodsHtml, 'section', 'Public Methods'), 'header', '');
      const transactionsMethodsHtmlWrapped = wrapIntoTags(wrapIntoTags(transactionMethodsHtml, 'section', 'Transaction Methods'), 'header', '');

      return wrapIntoTags(`${viewMethodsHtmlWrapped}${transactionsMethodsHtmlWrapped}`, 'div', contractName);
    })
    .join('\n');

  // const web3Tag = getWeb3Tag();
  const headerTag = getHeaderTag(projectDescription, projectImage, projectName);
  const customJavascript = getCustomJavascriptTag(projectNetworkId, projectNetworkName);
  const scriptTag = getScriptTag(projectId);
  const html = createHtmlTemplate(`${headerTag}${tags}${scriptTag}${customJavascript}`);

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
//console.log(getEntireHtml(abi, 1234))
