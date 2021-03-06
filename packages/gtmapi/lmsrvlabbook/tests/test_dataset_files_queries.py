# Copyright (c) 2017 FlashX, LLC
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
import pytest
import os
from snapshottest import snapshot
from lmsrvlabbook.tests.fixtures import fixture_single_dataset


class TestDatasetFilesQueries(object):
    def test_get_dataset_files(self, fixture_single_dataset, snapshot):
        query = """{
                    dataset(name: "test-dataset", owner: "default") {
                      id
                      name
                      description
                      allFiles {
                        edges{
                            node {
                              key
                              isDir
                              isLocal
                              size
                            }
                            cursor
                        }
                        pageInfo{
                          hasNextPage
                          hasPreviousPage
                          endCursor
                        }
                      }
                    }
                    }
                """
        r = fixture_single_dataset[2].execute(query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        query = """{
                           dataset(name: "test-dataset", owner: "default") {
                             id
                             name
                             description
                             allFiles(first: 2) {
                               edges{
                                   node {
                                     key
                                     isDir
                                     isLocal
                                     size
                                   }
                                   cursor
                               }
                               pageInfo{
                                 hasNextPage
                                 hasPreviousPage
                                 endCursor
                               }
                             }
                           }
                           }
                       """
        r = fixture_single_dataset[2].execute(query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        query = """{
                       dataset(name: "test-dataset", owner: "default") {
                         id
                         name
                         description
                         allFiles(first: 1, after: "MQ==") {
                           edges{
                               node {
                                 key
                                 isDir
                                 isLocal
                                 size
                               }
                               cursor
                           }
                           pageInfo{
                             hasNextPage
                             hasPreviousPage
                             endCursor
                           }
                         }
                       }
                       }
                   """
        r = fixture_single_dataset[2].execute(query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        query = """{
                       dataset(name: "test-dataset", owner: "default") {
                         id
                         name
                         description
                         allFiles(first: 100, after: "MQ==") {
                           edges{
                               node {
                                 key
                                 isDir
                                 isLocal
                                 size
                               }
                               cursor
                           }
                           pageInfo{
                             hasNextPage
                             hasPreviousPage
                             endCursor
                           }
                         }
                       }
                       }
                   """
        r = fixture_single_dataset[2].execute(query)
        assert 'errors' not in r
        snapshot.assert_match(r)

    def test_get_dataset_files_missing(self, fixture_single_dataset, snapshot):
        query = """{
                    dataset(name: "test-dataset", owner: "default") {
                      id
                      name
                      description
                      allFiles {
                        edges{
                            node {
                              key
                              isDir
                              isLocal
                              size
                            }
                            cursor
                        }
                        pageInfo{
                          hasNextPage
                          hasPreviousPage
                          endCursor
                        }
                      }
                    }
                    }
                """
        r = fixture_single_dataset[2].execute(query)
        assert 'errors' not in r
        snapshot.assert_match(r)

        ds = fixture_single_dataset[3]
        cache_mgr = fixture_single_dataset[4]
        revision = ds.git.repo.head.commit.hexsha
        os.remove(os.path.join(cache_mgr.cache_root, revision, 'test1.txt'))
        os.remove(os.path.join(cache_mgr.cache_root, revision, 'test2.txt'))

        query = """{
                    dataset(name: "test-dataset", owner: "default") {
                      id
                      name
                      description
                      allFiles {
                        edges{
                            node {
                              key
                              isDir
                              isLocal
                              size
                            }
                            cursor
                        }
                        pageInfo{
                          hasNextPage
                          hasPreviousPage
                          endCursor
                        }
                      }
                    }
                    }
                """
        r = fixture_single_dataset[2].execute(query)
        assert 'errors' not in r
        snapshot.assert_match(r)
