import time
import uuid
import pprint
import json

from misc import (gqlquery as run_query, endpt_post, USERNAME,
                  make_random_file, container_under_test, drop_file,
                  cleanup_random_files)


createLabbookQuery = '''
    mutation CreateLabbook($name: String!) {
        createLabbook(input: {
            name: $name,
            description: "Created via test harness",
            repository: "gigantum_environment-components",
            componentId: "python3-minimal",
            revision: 4
        }) {
            labbook {
                id
                name
            }
        }
    }
'''


buildQuery = '''
    mutation BuildQuery($owner: String!, $labbookName: String!) {
        buildImage(input: {
            owner: $owner,
            labbookName: $labbookName
        }) {
            backgroundJobKey
        }
    }
'''


publishLabbookQuery = '''
    mutation PublishLabbook($owner: String!, $name: String!,
                            $setPublic: Boolean!) {
        publishLabbook(input: {
            owner: $owner,
            labbookName: $name
            setPublic: $setPublic
        }) {
            jobKey
        }
    }
'''


syncLabbookQuery = '''
    mutation SyncLabbook($owner: String!, $name: String!) {
        syncLabbook(input: {
            owner: $owner,
            labbookName: $name
        }) {
            jobKey
        }
    }
'''


labbookQuery = '''
    query GetLabbook($owner: String!, $name: String!) {
        labbook(name: $name, owner: $owner) {
            id
            owner
            name
            description
            sizeBytes
            backgroundJobs {
                jobKey
                status
                result
                jobMetadata
                failureMessage
            }
        }
    }
'''




def publish_labbook(endpoint, variables) -> float:
    # Publish labbook mutation
    v = variables
    v.update({'setPublic': False})
    d = run_query(endpoint, 'Publish Labbook',  publishLabbookQuery, v)
    job_key = d['data']['publishLabbook']['jobKey']

    waiting = True
    t0 = time.time()
    while waiting:
        d = run_query(endpoint, 'Query Publish Status', labbookQuery,
                      variables)
        bgjobs = d['data']['labbook']['backgroundJobs']
        for j in bgjobs:
            md = json.loads(j['jobMetadata'])
            if md.get('method') == 'publish_labbook':
                if j['status'] in ['failed', 'finished']:
                    tfin = time.time()
                    pub_time = tfin-t0
                    print(f'Published project {d["data"]["labbook"]["owner"]}'
                          f'/{d["data"]["labbook"]["name"]} '
                          f'(size {d["data"]["labbook"]["sizeBytes"]}b) '
                          f'in {pub_time:.2f}s')
                    waiting = False
                    return pub_time
        time.sleep(1)


def sync_labbook(endpoint, variables):
    d = run_query(endpoint, 'Sync Labbook', syncLabbookQuery, variables)
    job_key = d['data']['syncLabbook']['jobKey']

    waiting = True
    t0 = time.time()
    while waiting:
        d = run_query(endpoint, 'Query Sync Status', labbookQuery,
                      variables)
        bgjobs = [n for n in d['data']['labbook']['backgroundJobs'] if n['jobKey'] == job_key]
        for j in bgjobs:
            md = json.loads(j['jobMetadata'])
            if md.get('method') == 'sync_labbook':
                if j['status'] == 'finished':
                    tfin = time.time()
                    sync_time = tfin-t0
                    print(f'Synced project {d["data"]["labbook"]["owner"]}'
                          f'/{d["data"]["labbook"]["name"]} '
                          f'(size {d["data"]["labbook"]["sizeBytes"]}b) '
                          f'in {sync_time:.2f}s')
                    waiting = False
                    pprint.pprint(md)
                    pprint.pprint(j)
                    return sync_time
                elif j['status'] == 'failed':
                    print(f'FAIL Sync after {time.time()-t0:.2f}s')
                    pprint.pprint(md)
                    pprint.pprint(j)
                    waiting = False
                    break
        time.sleep(1)


def check_limit(desc, time_allowed, time_executed):
    if time_executed > time_allowed:
        failt = color('OVERTIME', 'orange')
        print(f'[{failt}] {desc} (max {time_allowed:.2f}s; took {time_executed:.2f}s)')
    else:
        passt = color('PASS', 'green')
        print(f'[{passt}] {desc} (max {time_allowed:.2f}s; took {time_executed:.2f}s)')

if __name__ == '__main__':
    lbname = f'cli-{uuid.uuid4().hex[:4]}'
    print(f'Using labbook name: {lbname}')

    endpoint = endpt_post
    container_id = container_under_test()
    run_query(endpoint, 'Create Labbook', createLabbookQuery,
            {'name': lbname})

    print(f'## Publishing {lbname} (bare, brand-new Project)')
    t = publish_labbook(endpoint, variables={'name': lbname, 'owner': USERNAME})
    check_limit("Publish bare", 5.0, t)

    print(f'## Syncing {lbname} (no upstream or local changes)')
    sync_labbook(endpoint, variables={'name': lbname, 'owner': USERNAME})

    print(f'## Syncing {lbname} (1 MB file in code and input)')
    drop_file(container_id, make_random_file(1000000), USERNAME, USERNAME, lbname, 'code')
    drop_file(container_id, make_random_file(1000000), USERNAME, USERNAME, lbname, 'input')
    sync_labbook(endpoint, variables={'name': lbname, 'owner': USERNAME})

    print(f'## Syncing {lbname} (50 MB file in code and input)')
    drop_file(container_id, make_random_file(50000000), USERNAME, USERNAME, lbname, 'code')
    drop_file(container_id, make_random_file(50000000), USERNAME, USERNAME, lbname, 'input')
    sync_labbook(endpoint, variables={'name': lbname, 'owner': USERNAME})

    print(f'## Syncing {lbname} (100MB file in code and input)')
    drop_file(container_id, make_random_file(100000000), USERNAME, USERNAME, lbname, 'code')
    drop_file(container_id, make_random_file(100000000), USERNAME, USERNAME, lbname, 'input')
    sync_labbook(endpoint, variables={'name': lbname, 'owner': USERNAME})


    cleanup_random_files()
