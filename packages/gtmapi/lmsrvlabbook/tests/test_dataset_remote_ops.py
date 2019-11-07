import responses

from snapshottest import snapshot
from lmsrvlabbook.tests.fixtures import fixture_working_dir, mock_enable_unmanaged_for_testing,\
    fixture_working_dir_dataset_tests
from lmsrvlabbook.tests.mock_hub_api import mock_project_list_az, mock_project_list_za, mock_project_list_az_end, \
    mock_project_list_modified_desc, mock_project_list_modified_asc, mock_project_list_page_1, mock_project_list_page_2


class TestDatasetRemoteOperations(object):
    # Note, we re-use the mock data for Projects in these tests. Due to how the client is now calling the graphql API
    # and the limitations of the `responses` library, there is not really any difference if we returned results from
    # a Dataset fragment vs a Project fragment because the fields are the same in this case and all of the logic is
    # really in the Gateway API.

    def test_list_remote_datasets_invalid_args(self, fixture_working_dir_dataset_tests, snapshot):
        """test list datasets"""
        list_query = """
                    {
                    datasetList{
                      remoteDatasets(orderBy: "asdf", sort: "desc", first: 2){
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
        r = fixture_working_dir_dataset_tests[2].execute(list_query)
        assert 'errors' in r
        assert r['data']['datasetList']['remoteDatasets'] is None
        assert 'Unsupported order_by' in r['errors'][0]['message']

        list_query = """
                    {
                    datasetList{
                      remoteDatasets(orderBy: "name", sort: "asdf", first: 2){
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
        r = fixture_working_dir_dataset_tests[2].execute(list_query)
        assert 'errors' in r
        assert r['data']['datasetList']['remoteDatasets'] is None
        assert 'Unsupported sort' in r['errors'][0]['message']

    @responses.activate
    def test_list_remote_datasets_az(self, fixture_working_dir_dataset_tests, snapshot):
        """test list datasets"""
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_az, status=200)
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_za, status=200)
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_az_end, status=200)

        list_query = """
                    {
                    datasetList{
                      remoteDatasets(orderBy: "name", sort: "desc", first: 2){
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
                          hasPreviousPage
                          startCursor
                          endCursor
                        }
                      }
                    }
                    }"""

        r = fixture_working_dir_dataset_tests[2].execute(list_query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        list_query = """
                    {
                    datasetList{
                      remoteDatasets(first: 3){
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

        r = fixture_working_dir_dataset_tests[2].execute(list_query)
        assert 'errors' not in r
        print(r)
        snapshot.assert_match(r)

        list_query = """
                    {
                    datasetList{
                      remoteDatasets(orderBy: "name", sort: "asc", first: 3, after: "MTo3"){
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

        r = fixture_working_dir_dataset_tests[2].execute(list_query)
        assert 'errors' not in r
        assert len(r['data']['datasetList']['remoteDatasets']['edges']) == 0
        assert r['data']['datasetList']['remoteDatasets']['pageInfo']['hasNextPage'] is False

    @responses.activate
    def test_list_remote_datasets_modified(self, fixture_working_dir_dataset_tests, snapshot):
        """test list datasets"""
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_modified_desc, status=200)
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_modified_asc, status=200)

        list_query = """
                    {
                    datasetList{
                      remoteDatasets(orderBy: "modified_on", sort: "desc", first: 2){
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

        r = fixture_working_dir_dataset_tests[2].execute(list_query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        list_query = """
                    {
                    datasetList{
                      remoteDatasets(orderBy: "modified_on", sort: "asc", first: 10){
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

        r = fixture_working_dir_dataset_tests[2].execute(list_query)
        assert 'errors' not in r
        snapshot.assert_match(r)

    @responses.activate
    def test_list_remote_datasets_page(self, fixture_working_dir_dataset_tests, snapshot):
        """test list datasets"""
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_page_1, status=200)
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_page_2, status=200)
        responses.add(responses.POST, 'https://gigantum.com/api/v1',
                      json=mock_project_list_az_end, status=200)

        list_query = """
                    {
                    datasetList{
                      remoteDatasets(orderBy: "name", sort: "desc", first: 1){
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

        r = fixture_working_dir_dataset_tests[2].execute(list_query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        list_query = """
                    {
                    datasetList{
                      remoteDatasets(orderBy: "name", sort: "desc", first: 4, after: "MTow"){
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

        r = fixture_working_dir_dataset_tests[2].execute(list_query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        list_query = """
                    {
                    datasetList{
                      remoteDatasets(orderBy: "name", sort: "desc", first: 1, after: "Mjoz"){
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

        r = fixture_working_dir_dataset_tests[2].execute(list_query)
        assert 'errors' not in r
        assert len(r['data']['datasetList']['remoteDatasets']['edges']) == 0
        assert r['data']['datasetList']['remoteDatasets']['pageInfo']['hasNextPage'] is False
        assert r['data']['datasetList']['remoteDatasets']['pageInfo']['startCursor'] is None
        assert r['data']['datasetList']['remoteDatasets']['pageInfo']['endCursor'] is None

