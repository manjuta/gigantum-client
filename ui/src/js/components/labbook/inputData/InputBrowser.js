// vendor
import { createPaginationContainer, graphql } from 'react-relay';
// component
import SectionBrowser from 'Components/shared/filesShared/sectionBrowser/SectionBrowser';

export default createPaginationContainer(
  SectionBrowser,
  {

    input: graphql`
        fragment InputBrowser_input on LabbookSection{
          allFiles(after: $cursor, first: $first)@connection(key: "InputBrowser_allFiles", filters: []){
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
      return props.input && props.input.allFiles;
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
        query InputBrowserPaginationQuery(
          $first: Int
          $cursor: String
          $owner: String!
          $name: String!
        ) {
          labbook(name: $name, owner: $owner){
            input{
              # You could reference the fragment defined previously.
              ...InputBrowser_input
            }
          }
        }
      `,
  },
);
