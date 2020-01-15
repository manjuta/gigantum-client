// vendor
import { createPaginationContainer, graphql } from 'react-relay';
// component
import SectionBrowser from 'Components/shared/filesShared/sectionBrowser/SectionBrowser';

export default createPaginationContainer(
  SectionBrowser,
  {

    output: graphql`
        fragment OutputBrowser_output on LabbookSection{
          allFiles(after: $cursor, first: $first)@connection(key: "OutputBrowser_allFiles", filters:[]){
            edges{
              node{
                id
                isDir
                modifiedAt
                key
                size
              }
              cursor
            }
            pageInfo{
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }

        }`,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.output && props.output.allFiles;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }) {
      const { owner, name } = props;

      return {
        first: count,
        cursor,
        owner,
        name,
      };
    },
    query: graphql`
        query OutputBrowserPaginationQuery(
          $first: Int
          $cursor: String
          $owner: String!
          $name: String!
        ) {
          labbook(name: $name, owner: $owner){
             id
             description
             output{
              # You could reference the fragment defined previously.
              ...OutputBrowser_output
            }
          }
        }
      `,
  },
);
