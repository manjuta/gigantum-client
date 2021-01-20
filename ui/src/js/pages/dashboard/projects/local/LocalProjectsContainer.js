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
      fragment LocalProjectsContainer_projectList on LabbookQuery{
        labbookList{
          id
          ...LocalProjects_localProjects
        }
      }
    `,
  },
);
