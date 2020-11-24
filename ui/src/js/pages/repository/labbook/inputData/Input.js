// vendor
import { createFragmentContainer, graphql } from 'react-relay';
// component
import SectionWrapper from 'Pages/repository/shared/filesShared/sectionWrapper/SectionWrapper';

export default createFragmentContainer(
  SectionWrapper,
  {
    labbook: graphql`
      fragment Input_labbook on Labbook {
        input @skip (if: $inputSkip){
          id
          hasFiles
          ...InputBrowser_input
        }
        linkedDatasets @skip (if: $inputSkip){
          name
          owner
          commitsBehind
          overview{
            numFiles
            localBytes
            totalBytes
          }
          allFiles{
            edges{
              node{
                id
                owner
                name
                key
                isDir
                isLocal
                modifiedAt
                size
              }
            }
          }
        }
      }
    `,
  },
);
