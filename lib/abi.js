const getEvents = (abi = []) => abi.filter(({ type }) => type === 'event');

const getMethods = (abi = []) => abi.filter(({ type }) => type !== 'event');

const getViewMethods = (abi = []) => abi.filter(({ stateMutability }) => stateMutability === 'view');

const getTransactionMethods = (abi = []) =>
  abi.filter(({ constant, type }) => !constant && type !== 'constructor' && type !== 'event');

module.exports = { getEvents, getMethods, getViewMethods, getTransactionMethods };
