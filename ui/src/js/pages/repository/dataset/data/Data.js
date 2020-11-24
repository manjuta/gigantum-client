// vendor
import { createFragmentContainer, graphql } from 'react-relay';
// component
import SectionWrapper from 'Pages/repository/shared/filesShared/sectionWrapper/SectionWrapper';

export default createFragmentContainer(
  SectionWrapper,
  {
    dataset: graphql`
      fragment Data_dataset on Dataset{
        id @skip (if: $dataSkip)
        ...DataBrowser_data @skip (if: $dataSkip)
      }
    `,
  },
);
