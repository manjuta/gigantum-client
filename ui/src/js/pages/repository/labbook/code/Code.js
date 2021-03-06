// vendor
import { createFragmentContainer, graphql } from 'react-relay';
// component
import SectionWrapper from 'Pages/repository/shared/filesShared/sectionWrapper/SectionWrapper';

export default createFragmentContainer(
  SectionWrapper,
  {
    labbook: graphql`
      fragment Code_labbook on Labbook{
        code @skip (if: $codeSkip){
          id
          hasFiles
          ...CodeBrowser_code
        }
      }
    `,
  },
);
