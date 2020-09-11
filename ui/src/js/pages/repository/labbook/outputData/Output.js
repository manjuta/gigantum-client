// vendor
import { createFragmentContainer, graphql } from 'react-relay';
// component
import SectionWrapper from 'Pages/repository/shared/filesShared/sectionWrapper/SectionWrapper';

export default createFragmentContainer(
  SectionWrapper,
  {
    labbook: graphql`
      fragment Output_labbook on Labbook {
        output @skip (if: $outputSkip){
          id
          hasFiles
          ...OutputBrowser_output
        }
      }
    `,
  },
);
