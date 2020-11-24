import { createBrowserHistory } from 'history';

/**
*  @param {}
*  Mehtod gets basename for history object
*  @return {String}
*/
const getBasename = () => {
  const { pathname } = document.location;
  const pathList = pathname.split('/');
  const uniqueClientString = (pathList.length > 2)
    ? pathList[2]
    : '';
  const basename = (process.env.BUILD_TYPE === 'cloud')
    ? `/run/${uniqueClientString}/`
    : '/';
  return basename;
};

const basename = getBasename();

export default createBrowserHistory({
  basename,
  forceRefresh: false,
});
