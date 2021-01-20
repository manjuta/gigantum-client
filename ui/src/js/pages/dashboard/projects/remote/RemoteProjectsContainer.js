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
      fragment RemoteProjectsContainer_labbookList on LabbookQuery{
        labbookList{
          id
          ...RemoteProjects_remoteProjects
        }
      }
    `,
  },
);
