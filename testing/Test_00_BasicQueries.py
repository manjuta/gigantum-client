import time
import pprint

from colors import color

from misc import USERNAME, HOST, endpt_post


class QueryResponse(object):
    def __init__(self, query_obj, result_data: dict, duration: float):
        self.query_obj = query_obj
        self.result_data = result_data
        self.duration = duration

    @property
    def failed(self):
        has_err = 'errors' in self.result_data
        for c in self.query_obj.checks or []:
            try:
                pprint.pprint(self.result_data)
                if c(self.result_data) == False:
                    print('      Failure:', c)
                    has_err = True
            except Exception as e:
                print('      Failure:', c, e)
                has_err = True
        return has_err

    @property
    def timedout(self):
        return self.duration > self.query_obj.ctime

    def __str__(self):
        return f'<Response: {str(self.query_obj)} {self.duration:.2f}s/{self.query_obj.ctime:.2f}s>'


class GQuery(object):

    def __init__(self, desc: str, query: str, variables: dict, ctime: float = None, checks: list = None):
        self.desc = desc
        self.query = query
        self.variables = variables or {}
        self.data = {}
        # Compute time (how long the query/mutation should take)
        self.ctime = ctime
        self.checks = checks

    def __str__(self):
        return f'GQuery("{self.desc}")'

    def execute(self):
        t0 = time.time()
        data = endpt_post(self.query, self.variables)
        tf = time.time()
        return QueryResponse(query_obj=self, result_data=data, duration=tf-t0)


class Interaction(object):

    def __init__(self, desc: str, query_seq: list, validate_f: callable,
                 prequery: str = None, restdelay: int = 1):
        self.desc = desc
        self.query_seq = query_seq
        self.prequery = prequery
        self.validate_f = validate_f
        self.restdelay = 1
        self.dcnt = 0

    def __str__(self):
        return f'Interaction("{self.desc}")'

    def execute(self):
        t0 = time.time()
        endpt_post(self.prequery)
        time.sleep(self.restdelay)
        self.dcnt += 1

        for query in self.query_seq:
            data = endpt_post(query)
            time.sleep(self.restdelay)
            self.dcnt += 1
        tf = time.time()
        return self.validate_f(data), (tf-t0) - (self.dcnt * self.restdelay)



if __name__ == '__main__':
    tests = [
        GQuery('Get buildInfo', '{ buildInfo }', {}, 0.1),
        GQuery('Get cudaAvailable', '{ cudaAvailable }', {}, 0.1),
        GQuery('Get currentLabbookSchemaVersion', '{ currentLabbookSchemaVersion }', {}, 0.1),
        GQuery('Available Bases',
                '''
                {
                    availableBases {
                        edges {
                            node {    
                                name
                                componentId
                                revision
                                url
                                dockerImageNamespace
                                dockerImageRepository
                                dockerImageTag
                            }
                        }
                    }
                }
                ''', {}, 0.1),
        GQuery('List All Projects (Only basics, no sort)',
                '''
                {
                    labbookList {
                        localLabbooks {
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
                ''', {}, 0.5),
        GQuery('List All Projects (With DataLoader, No Sort)',
                '''
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
                ''', {}, 0.5),
        GQuery('List All Projects (With DataLoader, Explicit Sort)',
                '''
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
                ''', {}, 0.5),
        GQuery('List All Projects (With DataLoader, Explicit Sort Modified On)',
                '''
                {
                    labbookList {
                        localLabbooks(orderBy: "modified_on") {
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
                ''', {}, 0.5),
        GQuery('List Background Jobs',
                '''
                {
                    backgroundJobs {
                        edges {
                            node {
                                jobKey
                                jobMetadata
                                status
                                result
                            }
                        }
                    }
                }
                ''', {}, 0.5),
        GQuery('User Identity',
                '''
                {
                    userIdentity {
                        id
                        username
                        email
                        isSessionValid
                    }
                }
                ''', {}, 0.5,
                [lambda r: r['data']['userIdentity']['username'] == USERNAME]),
    ]

    for t in tests:
        r = t.execute()
        if r.failed:
            p = color('FAIL', 'red')
            print(f'[{p}]', t.desc, r)
        else:
            if r.timedout:
                p = color('PASS* (Overtime)', 'yellow')
            else:
                p = color('PASS', 'green')
            print(f'[{p}]', f'(x={r.duration:.2f}s, limit={t.ctime:.2f}s)', t.desc)


    print('-'*80)
    intr = [Interaction('Create a project then remove it',
            ['''
                mutation m {
                    createLabbook(input: {
                        name: "cli-labbook",
                        description: "Made by test harness",
                        repository: "gigantum_environment-components",
                        componentId: "python3-minimal",
                        revision: 4
                    }) {
                        labbook {
                            name
                            description
                        }
                    }
                }
                ''',
                '''
                {
                    labbook(owner: "bill2", name: "cli-labbook") {
                        owner
                        name
                        description
                    }
                }
                '''
            ],
            validate_f=lambda d: d['data']['labbook']['name'] == 'cli-labbook',
            prequery='''
                mutation d {
                    deleteLabbook(input: {
                        labbookName: "cli-labbook",
                        owner: "bill2",
                        confirm: true
                    }) {
                        success
                    }
                }
            ''')]
    for i in intr:
        res, dur = i.execute()
        if res is False:
            print('FAIL', str(i), f'{dur:.2f}s')
        else:
            print('PASS', str(i), f'{dur:.2f}s')
                    
