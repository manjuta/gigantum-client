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
import qs from 'querystring';
// utils
import getApiURL from 'JS/utils/apiUrl';

const oneHour = 60 * 60 * 1000;
const cache = new QueryResponseCache({ size: 250, ttl: oneHour });

function fetchQuery(operation, variables, cacheConfig, uploadables) {
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
  let body;
  const headers = {
    accept: '*/*',
  };

  if (
    isQuery
    && (fromCache !== null)
    && !forceFetch
  ) {
    return fromCache;
  }


  if (process.env.NODE_ENV === 'development') {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  if (uploadables && uploadables[0]) {
    if (uploadables[1]) {
      headers.authorization = `Bearer ${uploadables[1]}`;
      headers.Identity = `${uploadables[2]}`;
    }
  } else if (globalObject.location.href.indexOf('access_token') > -1) {
    const values = qs.parse(globalObject.location.hash.slice(1));
    const {
      access_token,
      id_token,
    } = values;
    if (access_token) {
      headers.authorization = `Bearer ${access_token}`;
      globalObject.localStorage.setItem('access_token', access_token);
      delete values.access_token;
    }
    if (id_token) {
      headers.Identity = `${id_token}`;
      globalObject.localStorage.setItem('id_token', id_token);
      delete values.id_token;
    }
    const stringifiedValues = qs.stringify(values);
    globalObject.localStorage.removeItem('fresh_login');
    globalObject.location.hash = stringifiedValues;
  } else if (globalObject.localStorage.getItem('access_token')) {
    const accessToken = globalObject.localStorage.getItem('access_token');
    const idToken = globalObject.localStorage.getItem('id_token');
    headers.authorization = `Bearer ${accessToken}`;
    headers.Identity = `${idToken}`;
  }

  if (uploadables === undefined) {
    headers['content-type'] = 'application/json';

    body = JSON.stringify({ query: queryString, variables });
  } else {
    body = new FormData();

    body.append('query', queryString);
    body.append('variables', JSON.stringify(variables));
    body.append('uploadChunk', uploadables[0]);
  }
  const apiURL = getApiURL('base');

  return fetch(apiURL, {
    method: 'POST',
    headers,
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
