import subprocess
import time
import uuid
import pprint
import os

from sgqlc.endpoint.http import HTTPEndpoint


USERNAME = os.environ['USERNAME']
TOKEN = os.environ['TOKEN']
HOST = 'http://localhost:10000/api/labbook'


endpt_get = HTTPEndpoint(HOST, base_headers={"Authorization": f"Bearer {TOKEN}"}, method='POST')
endpt_post = HTTPEndpoint(HOST, base_headers={"Authorization": f"Bearer {TOKEN}"}, method='POST')


def gqlquery(endpoint, qname, query, variables):
    print('-'*80)
    t0 = time.time()
    data = endpoint(query, variables)
    tf = time.time()
    print(f'Ran query {qname} in {tf-t0:.2f}s')
    if 'errors' in data:
        pprint.pprint(data)
        raise Exception()
    return data


def run(*args):
    print(f'Running: {" ".join(args)}')
    ret = subprocess.run(args, stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE, check=True)
    return ret


def cleanup_random_files():
    fs = [f for f in os.listdir('/tmp') if '.gigtest' in f]
    for f in fs:
        print(f'Removing temp file {f}')
        os.remove(f'/tmp/{f}')


def make_random_file(size_bytes: int):
    fname = f'/tmp/file{size_bytes}.gigtest'
    with open(fname, 'wb') as testf:
        testf.write(os.urandom(size_bytes))
    return fname


def drop_file(container_id: str, local_path: str, username: str, 
              owner: str, project_name: str, section: str):
    """ Put a file into the given container - does NOT use upload file mutation """

    run(*(f'docker cp {local_path} {container_id}:/mnt/gigantum/'
         f'{username}/{owner}/labbooks/{project_name}/{section}').split(' '))


def container_under_test():
    """ Infer given container under test """
    # TODO - Also infer given image under test
    dockerps = run('docker', 'ps').stdout.decode().split('\n')
    app_container_id = [c.split()[0] for c in dockerps
                        if 'labmanager' in c]
    if len(app_container_id) != 1:
        raise Exception("Could not infer Gigantum LabManager container")
    return app_container_id[0]


class TestResponse(object):
    def __init__(self, time_diff=None, fail_time=None,
                 failed_asserts=None, exc=None):
        self.time_diff = time_diff
        self.failed_asserts = failed_asserts
        self.exc = exc
        self.fail_time = fail_time


class HarnessQuery(object):

    def __init__(self, desc, query, variables, expected_response=None,
                 max_time_sec=None):
        self.desc = desc
        self.query = query
        self.variables = variables
        self.max_time_sec = max_time_sec
        self.expected_response = expected_response

    def __call__(self):
        t0 = time.time()
        try:
            data = endpt_post(self.query, self.variables)
            tFin = time.time()
            if self.expected_response:
                failures = []
                for check in self.expected_response:
                    try:
                        check(data)
                    except AssertionError as ae:
                        failures.append(ae)
            if failures:
                return TestResponse(failed_asserts=failures)
            else:
                return TestResponse(time_diff=tFin-t0)
        except Exception as e:
            tFail = time.time()
            print(e)
            return TestResponse(fail_time=tFail-t0, exc=e)

