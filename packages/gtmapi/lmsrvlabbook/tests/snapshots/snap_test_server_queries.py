# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestServerQueries.test_current_server_config 1'] = {
    'data': {
        'currentServer': {
            'authConfig': {
                'audience': 'api.test.gigantum.com',
                'clientId': 'Z6Wl854wqCjNY0D4uJx8SyPyySyfKmAy',
                'id': 'U2VydmVyQXV0aDp0ZXN0LWdpZ2FudHVtLWNvbQ==',
                'issuer': 'https://auth.gigantum.com/',
                'loginType': 'auth0',
                'loginUrl': 'https://test.gigantum.com/auth/redirect?target=login',
                'logoutUrl': 'https://test.gigantum.com/auth/redirect?target=logout',
                'publicKeyUrl': 'https://auth.gigantum.com/.well-known/jwks.json',
                'signingAlgorithm': 'RS256',
                'tokenUrl': 'https://test.gigantum.com/auth/token',
                'typeSpecificFields': [
                ]
            },
            'baseUrl': 'https://test.gigantum.com/',
            'gitServerType': 'gitlab',
            'gitUrl': 'https://test.repo.gigantum.com/',
            'hubApiUrl': 'https://test.gigantum.com/api/v1/',
            'id': 'U2VydmVyOnRlc3QtZ2lnYW50dW0tY29t',
            'lfsEnabled': True,
            'name': 'Gigantum Hub Test',
            'objectServiceUrl': 'https://test.api.gigantum.com/object-v1/',
            'serverId': 'test-gigantum-com',
            'userSearchUrl': 'https://user-search.us-east-1.cloudsearch.amazonaws.com'
        }
    }
}
