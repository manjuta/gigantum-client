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
    projectList: graphql`
      fragment RemoteProjectsContainer_projectList on LabbookQuery{
        labbookList{
          id
          ...RemoteProjects_remoteProjects
        }
      }
    `,
  },
);
