# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestAuthorizationMiddleware.test_not_authorized 1'] = {
    'data': {
        'cudaAvailable': None,
        'currentLabbookSchemaVersion': None,
        'currentServer': None
    },
    'errors': [
        {
            'locations': [
                {
                    'column': 18,
                    'line': 3
                }
            ],
            'message': "('User not authenticated', 401)",
            'path': [
                'cudaAvailable'
            ]
        },
        {
            'locations': [
                {
                    'column': 18,
                    'line': 4
                }
            ],
            'message': "('User not authenticated', 401)",
            'path': [
                'currentLabbookSchemaVersion'
            ]
        },
        {
            'locations': [
                {
                    'column': 18,
                    'line': 5
                }
            ],
            'message': "('User not authenticated', 401)",
            'path': [
                'currentServer'
            ]
        }
    ]
}

snapshots['TestAuthorizationMiddleware.test_authorized 1'] = {
    'data': {
        'cudaAvailable': False,
        'currentLabbookSchemaVersion': 2,
        'currentServer': {
            'id': 'U2VydmVyOnRlc3QtZ2lnYW50dW0tY29t',
            'name': 'Gigantum Hub Test',
            'serverId': 'test-gigantum-com'
        }
    }
}

snapshots['TestAuthorizationMiddleware.test_authorized_switch_servers 1'] = {
    'data': {
        'cudaAvailable': False,
        'currentLabbookSchemaVersion': 2,
        'currentServer': {
            'id': 'U2VydmVyOmFub3RoZXItc2VydmVy',
            'name': 'Another server',
            'serverId': 'another-server'
        }
    }
}
