# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestAddComponentMutations.test_add_package 1'] = {
    'data': {
        'addPackageComponents': {
            'clientMutationId': None,
            'newPackageComponentEdges': [
                {
                    'cursor': 'MA==',
                    'node': {
                        'fromBase': False,
                        'id': 'UGFja2FnZUNvbXBvbmVudDpjb25kYTMmcmVxdWVzdHMmMi4xOC40',
                        'manager': 'conda3',
                        'package': 'requests',
                        'schema': 1,
                        'version': '2.18.4'
                    }
                }
            ]
        }
    }
}

snapshots['TestAddComponentMutations.test_add_multiple_packages 1'] = {
    'data': {
        'addPackageComponents': {
            'clientMutationId': None,
            'newPackageComponentEdges': [
                {
                    'cursor': 'MA==',
                    'node': {
                        'fromBase': False,
                        'id': 'UGFja2FnZUNvbXBvbmVudDpwaXAzJnJlcXVlc3RzJjIuMTguNA==',
                        'manager': 'pip3',
                        'package': 'requests',
                        'schema': 1,
                        'version': '2.18.4'
                    }
                },
                {
                    'cursor': 'MQ==',
                    'node': {
                        'fromBase': False,
                        'id': 'UGFja2FnZUNvbXBvbmVudDpwaXAzJnJlc3BvbnNlcyYxLjQ=',
                        'manager': 'pip3',
                        'package': 'responses',
                        'schema': 1,
                        'version': '1.4'
                    }
                }
            ]
        }
    }
}

snapshots['TestAddComponentMutations.test_remove_package 1'] = {
    'data': {
        'addPackageComponents': {
            'clientMutationId': None,
            'newPackageComponentEdges': [
                {
                    'node': {
                        'id': 'UGFja2FnZUNvbXBvbmVudDpwaXAzJnJlcXVlc3RzJjIuMTguNA=='
                    }
                },
                {
                    'node': {
                        'id': 'UGFja2FnZUNvbXBvbmVudDpwaXAzJnJlc3BvbnNlcyYxLjQ='
                    }
                }
            ]
        }
    }
}

snapshots['TestAddComponentMutations.test_remove_package 2'] = {
    'data': {
        'removePackageComponents': {
            'clientMutationId': None,
            'success': True
        }
    }
}
