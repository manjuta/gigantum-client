import responses
from snapshottest import snapshot
from lmsrvlabbook.tests.fixtures import fixture_working_dir
from lmsrvlabbook.tests.mock_hub_api import mock_project_list_az, mock_project_list_za, mock_project_list_az_end, \
    mock_project_list_modified_desc, mock_project_list_modified_asc, mock_project_list_page_1, mock_project_list_page_2


class TestLabBookRemoteOperations(object):

    def test_list_remote_labbooks_invalid_args(self, fixture_working_dir, snapshot):
        """test list labbooks"""
        list_query = """
                    {
                    labbookList{
                      remoteLabbooks(orderBy: "asdf", sort: "desc", first: 2){
                        edges{
                          node{
                            id
                            description
                            creationDateUtc
                            modifiedDateUtc
                            name
                            owner
                            isLocal
                          }
                          cursor
                        }
                        pageInfo{
                          hasNextPage
                        }
                      }
                    }
                    }"""
        r = fixture_working_dir[2].execute(list_query)
        assert 'errors' in r
        assert r['data']['labbookList']['remoteLabbooks'] is None
        assert 'Unsupported order_by' in r['errors'][0]['message']

        list_query = """
                    {
                    labbookList{
                      remoteLabbooks(orderBy: "name", sort: "asdf", first: 2){
                        edges{
                          node{
                            id
                            description
                            creationDateUtc
                            modifiedDateUtc
                            name
                            owner
                            isLocal
                          }
                          cursor
                        }
                        pageInfo{
                          hasNextPage
                        }
                      }
                    }
                    }"""
        r = fixture_working_dir[2].execute(list_query)
        assert 'errors' in r
        assert r['data']['labbookList']['remoteLabbooks'] is None
        assert 'Unsupported sort' in r['errors'][0]['message']

    @responses.activate
    def test_list_remote_labbooks_az(self, fixture_working_dir, snapshot):
        """test list labbooks"""
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_az, status=200)
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_za, status=200)
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_az_end, status=200)

        list_query = """
                    {
                    labbookList{
                      remoteLabbooks(orderBy: "name", sort: "desc", first: 2){
                        edges{
                          node{
                            id
                            description
                            creationDateUtc
                            modifiedDateUtc
                            name
                            owner
                            isLocal
                            importUrl
                          }
                          cursor
                        }
                        pageInfo{
                          hasNextPage
                        }
                      }
                    }
                    }"""

        r = fixture_working_dir[2].execute(list_query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        list_query = """
                    {
                    labbookList{
                      remoteLabbooks(first: 3){
                        edges{
                          node{
                            id
                            description
                            creationDateUtc
                            modifiedDateUtc
                            name
                            owner
                          }
                          cursor
                        }
                        pageInfo{
                          hasNextPage
                        }
                      }
                    }
                    }"""

        r = fixture_working_dir[2].execute(list_query)
        assert 'errors' not in r
        print(r)
        snapshot.assert_match(r)

        list_query = """
                    {
                    labbookList{
                      remoteLabbooks(orderBy: "name", sort: "asc", first: 3, after: "MTo3"){
                        edges{
                          node{
                            id
                            description
                            creationDateUtc
                            modifiedDateUtc
                            name
                            owner
                          }
                          cursor
                        }
                        pageInfo{
                          hasNextPage
                        }
                      }
                    }
                    }"""

        r = fixture_working_dir[2].execute(list_query)
        assert 'errors' not in r
        assert len(r['data']['labbookList']['remoteLabbooks']['edges']) == 0
        assert r['data']['labbookList']['remoteLabbooks']['pageInfo']['hasNextPage'] is False

    @responses.activate
    def test_list_remote_labbooks_modified(self, fixture_working_dir, snapshot):
        """test list labbooks"""
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_modified_desc, status=200)
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_modified_asc, status=200)

        list_query = """
                    {
                    labbookList{
                      remoteLabbooks(orderBy: "modified_on", sort: "desc", first: 2){
                        edges{
                          node{
                            id
                            description
                            creationDateUtc
                            modifiedDateUtc
                            name
                            owner
                            isLocal
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
                    }
                    }"""

        r = fixture_working_dir[2].execute(list_query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        list_query = """
                    {
                    labbookList{
                      remoteLabbooks(orderBy: "modified_on", sort: "asc", first: 10){
                        edges{
                          node{
                            id
                            description
                            creationDateUtc
                            modifiedDateUtc
                            name
                            owner
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
                    }
                    }"""

        r = fixture_working_dir[2].execute(list_query)
        assert 'errors' not in r
        snapshot.assert_match(r)

    @responses.activate
    def test_list_remote_labbooks_page(self, fixture_working_dir, snapshot):
        """test list labbooks"""
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_page_1, status=200)
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_page_2, status=200)
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_az_end, status=200)

        list_query = """
                    {
                    labbookList{
                      remoteLabbooks(orderBy: "name", sort: "desc", first: 1){
                        edges{
                          node{
                            id
                            description
                            creationDateUtc
                            modifiedDateUtc
                            name
                            owner
                            isLocal
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
                    }
                    }"""

        r = fixture_working_dir[2].execute(list_query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        list_query = """
                    {
                    labbookList{
                      remoteLabbooks(orderBy: "name", sort: "desc", first: 4, after: "MTow"){
                        edges{
                          node{
                            id
                            description
                            creationDateUtc
                            modifiedDateUtc
                            name
                            owner
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
                    }
                    }"""

        r = fixture_working_dir[2].execute(list_query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        list_query = """
                    {
                    labbookList{
                      remoteLabbooks(orderBy: "name", sort: "desc", first: 1, after: "Mjoz"){
                        edges{
                          node{
                            id
                            description
                            creationDateUtc
                            modifiedDateUtc
                            name
                            owner
                          }
                          cursor
                        }
                        pageInfo{
                          hasNextPage
                          startCursor
                          endCursor
                        }
                      }
                    }
                    }"""

        r = fixture_working_dir[2].execute(list_query)
        assert 'errors' not in r
        assert len(r['data']['labbookList']['remoteLabbooks']['edges']) == 0
        assert r['data']['labbookList']['remoteLabbooks']['pageInfo']['hasNextPage'] is False
        assert r['data']['labbookList']['remoteLabbooks']['pageInfo']['startCursor'] is None
        assert r['data']['labbookList']['remoteLabbooks']['pageInfo']['endCursor'] is None

