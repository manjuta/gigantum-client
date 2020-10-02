// vendor
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';
// components
import Overview from 'Pages/repository/shared/overview/Overview';


export default createFragmentContainer(
  Overview,
  {
    dataset: graphql`fragment DatasetOverviewContainer_dataset on Dataset {
      overview @skip (if: $overviewSkip){
        id
        owner
        name
        numFiles
        totalBytes
        localBytes
        fileTypeDistribution
        readme
      }
    }`,
  },
);
