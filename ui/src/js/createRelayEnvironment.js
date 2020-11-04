// @flow
// vendor
import {
  Environment,
  Network,
  RecordSource,
  Store,
  ConnectionHandler,
  ViewerHandler,
  QueryResponseCache,
} from 'relay-runtime';
// utils
import getApiURL from 'JS/utils/apiUrl';
import getRequestData from 'JS/utils/getRequestData';

const oneHour = 60 * 60 * 1000;
const cache = new QueryResponseCache({ size: 250, ttl: oneHour });

function fetchQuery(
  operation,
  variables,
  cacheConfig,
  uploadables,
  overrideHeaders = {},
) {
  const queryID = operation.text;
  const isMutation = operation.operationKind === 'mutation';
  const isQuery = operation.operationKind === 'query';
  const forceFetch = cacheConfig && cacheConfig.force;

  // Try to get data from cache on queries
  const fromCache = cache.get(queryID, variables);
  /* eslint-disable */
  const globalObject = self || window;
  /* eslint-enable */
  const queryString = operation.params ? operation.params.text.replace(/(\r\n|\n|\r)/gm, '') : operation.text.replace(/(\r\n|\n|\r)/gm, '');

  if (
    isQuery
    && (fromCache !== null)
    && !forceFetch
  ) {
    return fromCache;
  }

  const {
    body,
    headers,
  } = getRequestData(
    queryString,
    variables,
    uploadables,
    overrideHeaders,
  );
  const apiURL = getApiURL('base');

  return fetch(apiURL, {
    method: 'POST',
    headers: {
      ...headers,
    },
    body,
  }).then(response => response.json()).then((json) => {
    // Update cache on queries
    if (isQuery && json) {
      cache.set(queryID, variables, json);
    }
    // Clear cache on mutations
    if (isMutation) {
      cache.clear();
    }
    return json;
  }).catch(error => error);
}

const network = Network.create(fetchQuery);

const handlerProvider = function handlerProvider(handle) {
  switch (handle) {
    // Augment (or remove from) this list
    case 'connection': return ConnectionHandler;
    case 'viewer': return ViewerHandler;
    default: return ConnectionHandler;
  }
};

const source = new RecordSource();
const store = new Store(source);
export default new Environment({ handlerProvider, network, store });

export {
  network,
  fetchQuery,
};
