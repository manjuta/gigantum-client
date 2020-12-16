// @flow
import uuidv4 from 'uuid/v4';

/**
 * @param {string} route
 * gets the url for
 * @return {string}
 */
const getApiURL = (route) => {
  /* eslint-disable */
  const globalObject = self || window;
  /* eslint-enable */
  const uuid = uuidv4();
  const location = self ? self.location : document.location;

  const { pathname } = location;
  const pathList = pathname ? pathname.split('/') : '';
  const cloudPath = pathList.length > 2 ? pathList[2] : '';
  const apiHost = (process.env.NODE_ENV === 'development')
    ? 'localhost:10000'
    : globalObject.location.host;
  let routePath = route === 'ping'
    ? `${process.env.PING_API}?v=${uuid}`
    : process.env.GIGANTUM_API;
  routePath = route === 'sysinfo'
    ? process.env.SYSINFO_API
    : routePath;
  routePath = route === 'server'
    ? process.env.SERVER_API
    : routePath;

  const apiPath = (process.env.BUILD_TYPE === 'cloud') && (process.env.NODE_ENV !== 'development')
    ? `/run/${cloudPath}${routePath}`
    : `${routePath}`;
  const apiURL = `${globalObject.location.protocol}//${apiHost}${apiPath}`;

  return apiURL;
};

export default getApiURL;
