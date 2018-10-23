import time
import uuid
import pprint
import json

from colors import color

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


exportLabbookQuery = '''
    mutation export($owner: String!, $name: String!) {
        exportLabbook(input: {
            owner: $owner,
            labbookName: $name
        }) {
            jobKey
        }
    }
'''


def export_labbook(endpoint, variables) -> float:
    # Publish labbook mutation
    v = variables
    d = run_query(endpoint, 'Export Labbook',  exportLabbookQuery, v)
    job_key = d['data']['publishLabbook']['jobKey']

    waiting = True
    t0 = time.time()
    while waiting:
        d = run_query(endpoint, 'Query Export Status', labbookQuery,
                      variables)
        bgjobs = d['data']['labbook']['backgroundJobs']
        for j in bgjobs:
            md = json.loads(j['jobMetadata'])
            if md.get('method') == 'export_labbook':
                if j['status'] in ['failed', 'finished']:
                    tfin = time.time()
                    pub_time = tfin-t0
                    print(f'Exported project {d["data"]["labbook"]["owner"]}'
                          f'/{d["data"]["labbook"]["name"]} '
                          f'(size {d["data"]["labbook"]["sizeBytes"]}b) '
                          f'in {pub_time:.2f}s')
                    waiting = False
                    return pub_time
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

    drop_file(container_id, make_random_file(1000000), USERNAME, USERNAME, lbname, 'code')
    drop_file(container_id, make_random_file(1000000), USERNAME, USERNAME, lbname, 'input')
    t = export_labbook(endpoint, variables={'name': lbname, 'owner': USERNAME})
    check_limit("Export 2MB LB", 5.0, t)

    print(f'## Export {lbname} (50 MB file in code and input)')
    drop_file(container_id, make_random_file(50000000), USERNAME, USERNAME, lbname, 'code')
    drop_file(container_id, make_random_file(50000000), USERNAME, USERNAME, lbname, 'input')
    t = export_labbook(endpoint, variables={'name': lbname, 'owner': USERNAME})
    check_limit("Export 100MB LB", 15.0, t)

    print(f'## Export {lbname} (100MB file in code and input)')
    drop_file(container_id, make_random_file(1000000000), USERNAME, USERNAME, lbname, 'code')
    drop_file(container_id, make_random_file(1000000000), USERNAME, USERNAME, lbname, 'input')
    t = export_labbook(endpoint, variables={'name': lbname, 'owner': USERNAME})
    check_limit("Export 2GB LB", 40.0, t)

    cleanup_random_files()

