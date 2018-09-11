# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestEnvironmentCustomDependencyQueries.test_get_available_custom_deps_pagination 1'] = {
    'data': {
        'availableCustomDependencies': {
            'edges': [
                {
                    'cursor': 'MA==',
                    'node': {
                        'componentId': 'noop-1',
                        'description': 'No Op for Unit Tests 1',
                        'dockerSnippet': '''RUN echo "Noop" > /dev/null
''',
                        'id': 'Q3VzdG9tQ29tcG9uZW50OmdpZy1kZXZfY29tcG9uZW50czImbm9vcC0xJjA=',
                        'license': None,
                        'name': 'Noop 1',
                        'repository': 'gig-dev_components2',
                        'requiredPackageManagers': None,
                        'revision': 0,
                        'tags': [
                            'ubuntu',
                            'python',
                            'python3',
                            'image',
                            'jpeg',
                            'png'
                        ],
                        'url': None
                    }
                }
            ],
            'pageInfo': {
                'hasNextPage': True,
                'hasPreviousPage': False
            }
        }
    }
}

snapshots['TestEnvironmentCustomDependencyQueries.test_get_available_custom_deps_pagination 2'] = {
    'data': {
        'availableCustomDependencies': {
            'edges': [
                {
                    'cursor': 'MQ==',
                    'node': {
                        'componentId': 'noop-2',
                        'description': 'No Op for Unit Tests 2',
                        'dockerSnippet': '''RUN echo "Noop" > /dev/null
''',
                        'id': 'Q3VzdG9tQ29tcG9uZW50OmdpZy1kZXZfY29tcG9uZW50czImbm9vcC0yJjA=',
                        'license': None,
                        'name': 'Noop 2',
                        'repository': 'gig-dev_components2',
                        'requiredPackageManagers': None,
                        'revision': 0,
                        'tags': [
                            'ubuntu',
                            'python',
                            'python3',
                            'image',
                            'jpeg',
                            'png'
                        ],
                        'url': None
                    }
                },
                {
                    'cursor': 'Mg==',
                    'node': {
                        'componentId': 'noop-3',
                        'description': 'No Op for Unit Tests 3',
                        'dockerSnippet': '''RUN echo "Noop" > /dev/null
''',
                        'id': 'Q3VzdG9tQ29tcG9uZW50OmdpZy1kZXZfY29tcG9uZW50czImbm9vcC0zJjA=',
                        'license': None,
                        'name': 'Noop 3',
                        'repository': 'gig-dev_components2',
                        'requiredPackageManagers': None,
                        'revision': 0,
                        'tags': [
                            'ubuntu',
                            'python',
                            'python3',
                            'image',
                            'jpeg',
                            'png'
                        ],
                        'url': None
                    }
                }
            ],
            'pageInfo': {
                'hasNextPage': True,
                'hasPreviousPage': False
            }
        }
    }
}

snapshots['TestEnvironmentCustomDependencyQueries.test_get_available_custom_deps 1'] = {
    'data': {
        'availableCustomDependencies': {
            'edges': [
                {
                    'node': {
                        'componentId': 'noop-1',
                        'description': 'No Op for Unit Tests 1',
                        'dockerSnippet': '''RUN echo "Noop" > /dev/null
''',
                        'id': 'Q3VzdG9tQ29tcG9uZW50OmdpZy1kZXZfY29tcG9uZW50czImbm9vcC0xJjA=',
                        'license': None,
                        'name': 'Noop 1',
                        'osBaseClass': 'ubuntu',
                        'repository': 'gig-dev_components2',
                        'requiredPackageManagers': None,
                        'revision': 0,
                        'schema': 1,
                        'tags': [
                            'ubuntu',
                            'python',
                            'python3',
                            'image',
                            'jpeg',
                            'png'
                        ],
                        'url': None
                    }
                },
                {
                    'node': {
                        'componentId': 'noop-2',
                        'description': 'No Op for Unit Tests 2',
                        'dockerSnippet': '''RUN echo "Noop" > /dev/null
''',
                        'id': 'Q3VzdG9tQ29tcG9uZW50OmdpZy1kZXZfY29tcG9uZW50czImbm9vcC0yJjA=',
                        'license': None,
                        'name': 'Noop 2',
                        'osBaseClass': 'ubuntu',
                        'repository': 'gig-dev_components2',
                        'requiredPackageManagers': None,
                        'revision': 0,
                        'schema': 1,
                        'tags': [
                            'ubuntu',
                            'python',
                            'python3',
                            'image',
                            'jpeg',
                            'png'
                        ],
                        'url': None
                    }
                },
                {
                    'node': {
                        'componentId': 'noop-3',
                        'description': 'No Op for Unit Tests 3',
                        'dockerSnippet': '''RUN echo "Noop" > /dev/null
''',
                        'id': 'Q3VzdG9tQ29tcG9uZW50OmdpZy1kZXZfY29tcG9uZW50czImbm9vcC0zJjA=',
                        'license': None,
                        'name': 'Noop 3',
                        'osBaseClass': 'ubuntu',
                        'repository': 'gig-dev_components2',
                        'requiredPackageManagers': None,
                        'revision': 0,
                        'schema': 1,
                        'tags': [
                            'ubuntu',
                            'python',
                            'python3',
                            'image',
                            'jpeg',
                            'png'
                        ],
                        'url': None
                    }
                },
                {
                    'node': {
                        'componentId': 'pillow',
                        'description': 'Pillow v4.2.1 for Ubuntu and Python3',
                        'dockerSnippet': '''RUN apt-get -y install libjpeg-dev libtiff5-dev zlib1g-dev libfreetype6-dev liblcms2-dev libopenjpeg-dev
RUN pip3 install Pillow==4.2.1
''',
                        'id': 'Q3VzdG9tQ29tcG9uZW50OmdpZy1kZXZfY29tcG9uZW50czImcGlsbG93JjA=',
                        'license': 'PIL Software License',
                        'name': 'Pillow',
                        'osBaseClass': 'ubuntu',
                        'repository': 'gig-dev_components2',
                        'requiredPackageManagers': [
                            'apt',
                            'pip'
                        ],
                        'revision': 0,
                        'schema': 1,
                        'tags': [
                            'ubuntu',
                            'python',
                            'python3',
                            'image',
                            'jpeg',
                            'png'
                        ],
                        'url': 'http://pillow.readthedocs.io/en/4.2.1/'
                    }
                }
            ]
        }
    }
}

snapshots['TestEnvironmentCustomDependencyQueries.test_get_available_custom_deps_pagination_reverse 1'] = {
    'data': {
        'availableCustomDependencies': {
            'edges': [
                {
                    'cursor': 'Mw==',
                    'node': {
                        'componentId': 'pillow',
                        'description': 'Pillow v4.2.1 for Ubuntu and Python3',
                        'dockerSnippet': '''RUN apt-get -y install libjpeg-dev libtiff5-dev zlib1g-dev libfreetype6-dev liblcms2-dev libopenjpeg-dev
RUN pip3 install Pillow==4.2.1
''',
                        'id': 'Q3VzdG9tQ29tcG9uZW50OmdpZy1kZXZfY29tcG9uZW50czImcGlsbG93JjA=',
                        'license': 'PIL Software License',
                        'name': 'Pillow',
                        'repository': 'gig-dev_components2',
                        'requiredPackageManagers': [
                            'apt',
                            'pip'
                        ],
                        'revision': 0,
                        'tags': [
                            'ubuntu',
                            'python',
                            'python3',
                            'image',
                            'jpeg',
                            'png'
                        ],
                        'url': 'http://pillow.readthedocs.io/en/4.2.1/'
                    }
                }
            ],
            'pageInfo': {
                'hasNextPage': False,
                'hasPreviousPage': True
            }
        }
    }
}

snapshots['TestEnvironmentCustomDependencyQueries.test_get_available_custom_deps_pagination_reverse 2'] = {
    'data': {
        'availableCustomDependencies': {
            'edges': [
                {
                    'cursor': 'MA==',
                    'node': {
                        'componentId': 'noop-1',
                        'description': 'No Op for Unit Tests 1',
                        'dockerSnippet': '''RUN echo "Noop" > /dev/null
''',
                        'id': 'Q3VzdG9tQ29tcG9uZW50OmdpZy1kZXZfY29tcG9uZW50czImbm9vcC0xJjA=',
                        'license': None,
                        'name': 'Noop 1',
                        'repository': 'gig-dev_components2',
                        'requiredPackageManagers': None,
                        'revision': 0,
                        'tags': [
                            'ubuntu',
                            'python',
                            'python3',
                            'image',
                            'jpeg',
                            'png'
                        ],
                        'url': None
                    }
                }
            ],
            'pageInfo': {
                'hasNextPage': False,
                'hasPreviousPage': False
            }
        }
    }
}

snapshots['TestEnvironmentCustomDependencyQueries.test_get_custom_deps_by_node 1'] = {
    'data': {
        'node': {
            'componentId': 'pillow',
            'description': 'Pillow v4.2.1 for Ubuntu and Python3',
            'dockerSnippet': '''RUN apt-get -y install libjpeg-dev libtiff5-dev zlib1g-dev libfreetype6-dev liblcms2-dev libopenjpeg-dev
RUN pip3 install Pillow==4.2.1
''',
            'id': 'Q3VzdG9tQ29tcG9uZW50OmdpZy1kZXZfY29tcG9uZW50czImcGlsbG93JjA=',
            'license': 'PIL Software License',
            'name': 'Pillow',
            'repository': 'gig-dev_components2',
            'requiredPackageManagers': [
                'apt',
                'pip'
            ],
            'revision': 0,
            'tags': [
                'ubuntu',
                'python',
                'python3',
                'image',
                'jpeg',
                'png'
            ],
            'url': 'http://pillow.readthedocs.io/en/4.2.1/'
        }
    }
}
