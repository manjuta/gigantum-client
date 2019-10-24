// @flow
import uuidv4 from 'uuid/v4';

/**
 * @param {string} route
 * gets the url for
 * @return {string}
 */
const getApiURL = (route) => {
  /* eslint-disable */
  const globalObject = window || self;
  /* eslint-enable */
  const uuid = uuidv4();
  const { pathname } = globalObject.location;
  const pathList = pathname.split('/');
  const cloudPath = pathList.length > 2 ? pathList[2] : '';
  const apiHost = process.env.NODE_ENV === 'development'
    ? 'localhost:10000'
    : globalObject.location.host;
  const routePath = route === 'ping'
    ? `${process.env.PING_API}?v=${uuid}`
    : process.env.GIGANTUM_API;

  const apiPath = (process.env.BUILD_TYPE === 'cloud')
    ? `/run/${cloudPath}${routePath}`
    : `${routePath}`;
  const apiURL = `${globalObject.location.protocol}//${apiHost}${apiPath}`;

  return apiURL;
};

export default getApiURL;
