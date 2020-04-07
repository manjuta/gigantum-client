// vendor
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';
// components
import Labbooks from '../Labbooks';

export default createFragmentContainer(
  Labbooks,
  {
    labbookList: graphql`
      fragment RemoteLabbooksContainer_labbookList on LabbookQuery{
        labbookList{
          id
          ...RemoteLabbooks_remoteLabbooks
        }
      }
    `,
  },
);
