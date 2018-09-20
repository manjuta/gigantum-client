import time
import uuid
import pprint
import json

from misc import (gqlquery as run_query, endpt_post, USERNAME,
                  make_random_file, container_under_test, drop_file,
                  cleanup_random_files)


localLabbookQuery = '''
    {
        labbookList {
            localLabbooks(orderBy: "created_on") {
                edges {
                    node {
                        id
                        name
                        owner
                        description
                    }
                    cursor
                }
            }
        }
    }
'''


remoteLabbookQuery = '''
    {
        labbookList {
            remoteLabbooks {
                edges {
                    node {
                        id
                        name
                        owner
                    }
                    cursor
                }
            }
        }
    }
'''

deleteLocalLabbook = '''
    mutation DeleteLocal($owner: String!, $lbname: String!) {
        deleteLabbook(input: {
            owner: $owner,
            labbookName: $lbname,
            confirm: true
        }) {
            success
        }
    }
'''


deleteRemoteLabbook = '''
    mutation DeleteRemote($owner: String!, $lbname: String!) {
        deleteRemoteLabbook(input: {
            owner: $owner,
            labbookName: $lbname,
            confirm: true
        }) {
            success
        }
    }
'''


if __name__ == '__main__':
    container_id = container_under_test()
    d = run_query(endpt_post, 'Get Local Labbooks', localLabbookQuery, {})
    local_lbs = d['data']['labbookList']['localLabbooks']['edges']
    for llb in local_lbs:
        if 'cli-' in llb['node']['name']:
            d = run_query(endpt_post, f'Delete Local {llb["node"]["owner"]}/{llb["node"]["name"]}',
                    deleteLocalLabbook,
                    {'owner': llb["node"]["owner"],
                     'lbname': llb["node"]["name"]})
    
    d = run_query(endpt_post, 'Get Remote Labbooks', remoteLabbookQuery, {})
    remote_lbs = d['data']['labbookList']['remoteLabbooks']['edges']
    for rlb in remote_lbs:
        if 'cli-' in rlb['node']['name']:
            print(rlb)
            d = run_query(endpt_post, f'Delete Remote {rlb["node"]["owner"]}/{rlb["node"]["name"]}',
                    deleteRemoteLabbook,
                    {'owner': rlb["node"]["owner"],
                     'lbname': rlb["node"]["name"]})
