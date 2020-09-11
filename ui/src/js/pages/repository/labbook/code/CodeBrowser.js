// vendor
import { createPaginationContainer, graphql } from 'react-relay';
// component
import SectionBrowser from 'Pages/repository/shared/filesShared/sectionBrowser/SectionBrowser';

export default createPaginationContainer(
  SectionBrowser,
  {

    code: graphql`
        fragment CodeBrowser_code on LabbookSection{
          allFiles(after: $cursor, first: $first)@connection(key: "CodeBrowser_allFiles", filters: []){
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
      return props.code && props.code.allFiles;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount,
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
        query CodeBrowserPaginationQuery(
          $first: Int
          $cursor: String
          $owner: String!
          $name: String!
        ) {
          labbook(name: $name, owner: $owner){
             id
             description
             code{
               id
              # You could reference the fragment defined previously.
              ...CodeBrowser_code

            }
          }
        }
      `,
  },

);
