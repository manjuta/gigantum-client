// vendor
import qs from 'querystring';

/* eslint-disable */
const globalObject = self || window;
/* eslint-enable */

/**
 * Method returns the body for a request
 * @param {string} queryString
 * @param {object} variables
 * @param {Array} uploadables
 *
 * @return {Object}
 */
const getBody = (queryString, variables, uploadables) => {
  if ((uploadables === undefined) || (uploadables === null)) {
    return JSON.stringify({ query: queryString, variables });
  }

  const body = new FormData();
  body.append('query', queryString);
  body.append('variables', JSON.stringify(variables));
  body.append('uploadChunk', uploadables[0]);
  return body;
};

/**
* Method remvoes access and id token from the hashParams
* Method strinfigifies the modified hashParams and sets into location.hash
* @param {object} hashParams
*/
const cleanUpHash = (hashParams) => {
  delete hashParams.access_token;
  delete hashParams.id_token;
  const hash = qs.stringify(hashParams);
  globalObject.localStorage.removeItem('fresh_login');
  globalObject.location.hash = hash;
};


/**
 * Method returns the headers for a request
 * @param {string} queryString
 * @param {object} variables
 * @param {Array} uploadables
 * @param {Object} overrideHeaders
 *
 * @return {Object}
 */
const getHeaders = (
  queryString,
  variables,
  uploadables,
  overrideHeaders,
) => {
  const headersTemp = { accept: '*/*' };
  const hasAccessToken = globalObject.location.href.indexOf('access_token') > -1;
  const hasLocalStorageAccessToken = globalObject.localStorage && globalObject.localStorage.getItem('access_token');

  if (process.env.NODE_ENV === 'development') {
    headersTemp['Access-Control-Allow-Origin'] = '*';
  }

  // check if uploadables exists
  if (uploadables && uploadables[0]) {
    if (uploadables[1]) {
      headersTemp.authorization = `Bearer ${uploadables[1]}`;
      headersTemp.Identity = `${uploadables[2]}`;
    }
  } else if (hasAccessToken) {
    const hashParams = qs.parse(globalObject.location.hash.slice(1));
    const accessToken = hashParams.access_token;
    const idToken = hashParams.id_token;
    // remove tokens from the hash and sets in headersTemp
    if (accessToken && idToken) {
      headersTemp.authorization = `Bearer ${accessToken}`;
      headersTemp.Identity = `${idToken}`;
      globalObject.localStorage.setItem('id_token', idToken);
      globalObject.localStorage.setItem('access_token', accessToken);
      // clean up hash after assigning and storing tokens
      cleanUpHash(hashParams);
    }
  } else if (hasLocalStorageAccessToken) {
    const accessToken = globalObject.localStorage.getItem('access_token');
    const idToken = globalObject.localStorage.getItem('id_token');
    headersTemp.authorization = `Bearer ${accessToken}`;
    headersTemp.Identity = `${idToken}`;
  }

  // sets content type when for data is missing
  if ((uploadables === undefined) || (uploadables === null)) {
    headersTemp['content-type'] = 'application/json';
  }

  const headers = {
    ...headersTemp,
    ...overrideHeaders,
  };

  return headers;
};

/**
 * Method returns the headers and body for a request
 * @param {string} queryString
 * @param {object} variables
 * @param {Array} uploadables
 * @param {Object} overrideHeaders
 *
 * @return {Object}
 */
const getRequestData = (
  queryString,
  variables,
  uploadables,
  overrideHeaders,
) => {
  const body = getBody(queryString, variables, uploadables);
  const headers = getHeaders(
    queryString,
    variables,
    uploadables,
    overrideHeaders,
  );
  return { headers, body };
};

export default getRequestData;
