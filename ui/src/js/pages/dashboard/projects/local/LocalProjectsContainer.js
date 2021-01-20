// vendor
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';
// components
import Projects from '../Projects';

export default createFragmentContainer(
  Projects,
  {
    labbookList: graphql`
      fragment LocalLabbooksContainer_labbookList on LabbookQuery{
        labbookList{
          id
          ...LocalLabbooks_localLabbooks
        }
      }
    `,
  },
);
