# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestEnvironmentBaseImageQueries.test_get_base_image_by_node 1'] = {
    'data': {
        'node': {
            'componentId': 'quickstart-jupyterlab',
            'description': 'Data Science Quickstart using Jupyterlab, numpy, and Matplotlib. A great base for any analysis.',
            'developmentTools': [
                'jupyterlab'
            ],
            'dockerImageNamespace': 'gigantum',
            'dockerImageRepository': 'python3-minimal',
            'dockerImageServer': 'hub.docker.com',
            'dockerImageTag': '826b6f24-2018-02-09',
            'icon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
            'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnF1aWNrc3RhcnQtanVweXRlcmxhYiYx',
            'languages': [
                'python3'
            ],
            'license': 'MIT',
            'name': 'Data Science Quickstart with JupyterLab',
            'osClass': 'ubuntu',
            'osRelease': '16.04',
            'packageManagers': [
                'apt',
                'pip3'
            ],
            'readme': 'Empty for now',
            'tags': [
                'ubuntu',
                'python3',
                'jupyterlab'
            ],
            'url': None
        }
    }
}

snapshots['TestEnvironmentBaseImageQueries.test_get_available_base_images 1'] = {
    'data': {
        'availableBases': {
            'edges': [
                {
                    'node': {
                        'componentId': 'quickstart-jupyterlab',
                        'cudaVersion': None,
                        'description': 'Data Science Quickstart using Jupyterlab, numpy, and Matplotlib. A great base for any analysis.',
                        'developmentTools': [
                            'jupyterlab'
                        ],
                        'dockerImageNamespace': 'gigantum',
                        'dockerImageRepository': 'python3-minimal',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '1effaaea-2018-05-23',
                        'icon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnF1aWNrc3RhcnQtanVweXRlcmxhYiYy',
                        'installedPackages': [
                            'apt|vim|2:7.4.1689-3ubuntu1.2',
                            'pip3|numpy|1.14.0',
                            'pip3|matplotlib|2.1.1',
                            'pip3|jupyter|1.0.0',
                            'pip3|jupyterlab|0.31.1',
                            'pip3|ipywidgets|7.1.0',
                            'pip3|pandas|0.22.0'
                        ],
                        'languages': [
                            'python3'
                        ],
                        'license': 'MIT',
                        'name': 'Data Science Quickstart with JupyterLab',
                        'osClass': 'ubuntu',
                        'osRelease': '18.04',
                        'packageManagers': [
                            'apt',
                            'pip3'
                        ],
                        'readme': 'Empty for now',
                        'revision': 2,
                        'schema': 1,
                        'tags': [
                            'ubuntu',
                            'python3',
                            'jupyterlab'
                        ],
                        'url': None
                    }
                },
                {
                    'node': {
                        'componentId': 'ut-busybox',
                        'cudaVersion': None,
                        'description': 'Super lightweight image for build testing',
                        'developmentTools': [
                        ],
                        'dockerImageNamespace': 'library',
                        'dockerImageRepository': 'busybox',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '1.28.0',
                        'icon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnV0LWJ1c3lib3gmMA==',
                        'installedPackages': [
                        ],
                        'languages': [
                        ],
                        'license': 'MIT',
                        'name': 'Unit Test Busybox',
                        'osClass': 'busybox',
                        'osRelease': '1.28',
                        'packageManagers': [
                            'apt'
                        ],
                        'readme': 'Empty for now',
                        'revision': 0,
                        'schema': 1,
                        'tags': [
                            'busybox'
                        ],
                        'url': None
                    }
                },
                {
                    'node': {
                        'componentId': 'ut-jupyterlab-1',
                        'cudaVersion': None,
                        'description': 'Unit Test 1',
                        'developmentTools': [
                            'jupyterlab'
                        ],
                        'dockerImageNamespace': 'gigdev',
                        'dockerImageRepository': 'gm-quickstart',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '9718fedc-2018-01-16',
                        'icon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnV0LWp1cHl0ZXJsYWItMSYw',
                        'installedPackages': [
                            'apt|supervisor|latest',
                            'apt|curl|latest',
                            'apt|gosu|latest',
                            'apt|build-essential|latest',
                            'apt|python3-dev|latest',
                            'apt|python3-pip|latest',
                            'apt|git|latest',
                            'apt|curl|latest',
                            'apt|vim|latest',
                            'pip3|numpy|1.14.0',
                            'pip3|matplotlib|2.1.1',
                            'pip3|jupyter|1.0.0',
                            'pip3|jupyterlab|0.31.1',
                            'pip3|ipywidgets|7.1.0',
                            'pip3|pandas|0.22.0'
                        ],
                        'languages': [
                            'python3'
                        ],
                        'license': 'MIT',
                        'name': 'Unit Test1',
                        'osClass': 'ubuntu',
                        'osRelease': '16.04',
                        'packageManagers': [
                            'apt',
                            'pip3'
                        ],
                        'readme': 'Empty for now',
                        'revision': 0,
                        'schema': 1,
                        'tags': [
                            'ubuntu',
                            'python3',
                            'jupyterlab'
                        ],
                        'url': None
                    }
                },
                {
                    'node': {
                        'componentId': 'ut-jupyterlab-2',
                        'cudaVersion': None,
                        'description': 'Unit Test 2',
                        'developmentTools': [
                            'jupyterlab'
                        ],
                        'dockerImageNamespace': 'gigdev',
                        'dockerImageRepository': 'gm-quickstart',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '9718fedc-2018-01-16',
                        'icon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnV0LWp1cHl0ZXJsYWItMiYw',
                        'installedPackages': [
                            'apt|supervisor|latest',
                            'apt|python3-dev|latest',
                            'apt|python3-pip|latest',
                            'apt|git|latest',
                            'apt|curl|latest',
                            'apt|vim|latest',
                            'pip3|numpy|1.14.0',
                            'pip3|matplotlib|2.1.1',
                            'pip3|jupyter|1.0.0',
                            'pip3|jupyterlab|0.31.1'
                        ],
                        'languages': [
                            'python3'
                        ],
                        'license': 'MIT',
                        'name': 'Unit Test 2',
                        'osClass': 'ubuntu',
                        'osRelease': '16.04',
                        'packageManagers': [
                            'apt',
                            'pip3'
                        ],
                        'readme': 'Empty for now',
                        'revision': 0,
                        'schema': 1,
                        'tags': [
                            'ubuntu',
                            'python3',
                            'jupyterlab'
                        ],
                        'url': None
                    }
                },
                {
                    'node': {
                        'componentId': 'ut-jupyterlab-3',
                        'cudaVersion': None,
                        'description': 'Unit Test 3',
                        'developmentTools': [
                            'jupyterlab'
                        ],
                        'dockerImageNamespace': 'gigdev',
                        'dockerImageRepository': 'gm-quickstart',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '9718fedc-2018-01-16',
                        'icon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnV0LWp1cHl0ZXJsYWItMyYw',
                        'installedPackages': [
                            'apt|supervisor|latest',
                            'apt|python3-dev|latest',
                            'apt|python3-pip|latest',
                            'apt|git|latest',
                            'apt|curl|latest',
                            'pip3|jupyter|1.0.0',
                            'pip3|jupyterlab|0.31.1'
                        ],
                        'languages': [
                            'python3'
                        ],
                        'license': 'MIT',
                        'name': 'Unit Test 3',
                        'osClass': 'ubuntu',
                        'osRelease': '16.04',
                        'packageManagers': [
                            'apt',
                            'pip3'
                        ],
                        'readme': 'Empty for now',
                        'revision': 0,
                        'schema': 1,
                        'tags': [
                            'ubuntu',
                            'python3',
                            'jupyterlab'
                        ],
                        'url': None
                    }
                },
                {
                    'node': {
                        'componentId': 'ut-rstudio-server',
                        'cudaVersion': None,
                        'description': 'R + tidyverse packages in RStudio® Server',
                        'developmentTools': [
                            'rstudio',
                            'jupyterlab',
                            'notebook'
                        ],
                        'dockerImageNamespace': 'gigantum',
                        'dockerImageRepository': 'rstudio-server',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '87c90e7834-2019-07-19',
                        'icon': 'data:image/png;base64,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',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnV0LXJzdHVkaW8tc2VydmVyJjE=',
                        'installedPackages': [
                            'apt|r-recommended|3.6.1-1bionic',
                            'apt|r-cran-tidyverse|1.2.1-3cran1ppa0bionic0',
                            'apt|r-cran-data.table|1.12.2-1cran1ppabionic0'
                        ],
                        'languages': [
                            'R',
                            'python3'
                        ],
                        'license': 'MIT',
                        'name': 'R Tidyverse in RStudio® Server',
                        'osClass': 'ubuntu',
                        'osRelease': '18.04',
                        'packageManagers': [
                            'apt',
                            'pip',
                            'conda3'
                        ],
                        'readme': '''A Base containing R 3.6 and Tidyverse from the official CRAN PPA configured
for use in RStudio® Server.  A conda-managed JupyterLab is also installed, and
OpenBLAS is configured.

You should generally use Apt with `r-cran-<package name>` to quickly install
"package name" from CRAN. You can also use Docker snippets for approaches
like `install.packages` or `devtools::install_github`. Don't hesitate to use
the "discuss" link (in the lower-right "?" bubble in the app) if you\'d like
some guidance!

*RStudio® and the RStudio logo are registered trademarks of RStudio, Inc.*
''',
                        'revision': 1,
                        'schema': 1,
                        'tags': [
                            'ubuntu',
                            'rstats',
                            'rstudio'
                        ],
                        'url': None
                    }
                }
            ]
        }
    }
}

snapshots['TestEnvironmentBaseImageQueries.test_get_available_base_images_pagination 1'] = {
    'data': {
        'availableBases': {
            'edges': [
                {
                    'cursor': 'MA==',
                    'node': {
                        'componentId': 'quickstart-jupyterlab',
                        'description': 'Data Science Quickstart using Jupyterlab, numpy, and Matplotlib. A great base for any analysis.',
                        'developmentTools': [
                            'jupyterlab'
                        ],
                        'dockerImageNamespace': 'gigantum',
                        'dockerImageRepository': 'python3-minimal',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '1effaaea-2018-05-23',
                        'icon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnF1aWNrc3RhcnQtanVweXRlcmxhYiYy',
                        'languages': [
                            'python3'
                        ],
                        'license': 'MIT',
                        'name': 'Data Science Quickstart with JupyterLab',
                        'osClass': 'ubuntu',
                        'osRelease': '18.04',
                        'packageManagers': [
                            'apt',
                            'pip3'
                        ],
                        'readme': 'Empty for now',
                        'tags': [
                            'ubuntu',
                            'python3',
                            'jupyterlab'
                        ],
                        'url': None
                    }
                }
            ],
            'pageInfo': {
                'hasNextPage': True
            }
        }
    }
}

snapshots['TestEnvironmentBaseImageQueries.test_get_available_base_images_pagination 2'] = {
    'data': {
        'availableBases': {
            'edges': [
                {
                    'cursor': 'Mg==',
                    'node': {
                        'componentId': 'ut-jupyterlab-1',
                        'description': 'Unit Test 1',
                        'developmentTools': [
                            'jupyterlab'
                        ],
                        'dockerImageNamespace': 'gigdev',
                        'dockerImageRepository': 'gm-quickstart',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '9718fedc-2018-01-16',
                        'icon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnV0LWp1cHl0ZXJsYWItMSYw',
                        'languages': [
                            'python3'
                        ],
                        'license': 'MIT',
                        'name': 'Unit Test1',
                        'osClass': 'ubuntu',
                        'osRelease': '16.04',
                        'packageManagers': [
                            'apt',
                            'pip3'
                        ],
                        'readme': 'Empty for now',
                        'tags': [
                            'ubuntu',
                            'python3',
                            'jupyterlab'
                        ],
                        'url': None
                    }
                },
                {
                    'cursor': 'Mw==',
                    'node': {
                        'componentId': 'ut-jupyterlab-2',
                        'description': 'Unit Test 2',
                        'developmentTools': [
                            'jupyterlab'
                        ],
                        'dockerImageNamespace': 'gigdev',
                        'dockerImageRepository': 'gm-quickstart',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '9718fedc-2018-01-16',
                        'icon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnV0LWp1cHl0ZXJsYWItMiYw',
                        'languages': [
                            'python3'
                        ],
                        'license': 'MIT',
                        'name': 'Unit Test 2',
                        'osClass': 'ubuntu',
                        'osRelease': '16.04',
                        'packageManagers': [
                            'apt',
                            'pip3'
                        ],
                        'readme': 'Empty for now',
                        'tags': [
                            'ubuntu',
                            'python3',
                            'jupyterlab'
                        ],
                        'url': None
                    }
                }
            ],
            'pageInfo': {
                'hasNextPage': True
            }
        }
    }
}

snapshots['TestEnvironmentBaseImageQueries.test_get_available_base_images_pagination 3'] = {
    'data': {
        'availableBases': {
            'edges': [
                {
                    'cursor': 'Mg==',
                    'node': {
                        'componentId': 'ut-jupyterlab-1',
                        'description': 'Unit Test 1',
                        'developmentTools': [
                            'jupyterlab'
                        ],
                        'dockerImageNamespace': 'gigdev',
                        'dockerImageRepository': 'gm-quickstart',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '9718fedc-2018-01-16',
                        'icon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnV0LWp1cHl0ZXJsYWItMSYw',
                        'languages': [
                            'python3'
                        ],
                        'license': 'MIT',
                        'name': 'Unit Test1',
                        'osClass': 'ubuntu',
                        'osRelease': '16.04',
                        'packageManagers': [
                            'apt',
                            'pip3'
                        ],
                        'readme': 'Empty for now',
                        'tags': [
                            'ubuntu',
                            'python3',
                            'jupyterlab'
                        ],
                        'url': None
                    }
                }
            ],
            'pageInfo': {
                'hasNextPage': True
            }
        }
    }
}

snapshots['TestEnvironmentBaseImageQueries.test_get_available_base_images_pagination_reverse 1'] = {
    'data': {
        'availableBases': {
            'edges': [
                {
                    'cursor': 'NQ==',
                    'node': {
                        'componentId': 'ut-rstudio-server',
                        'description': 'R + tidyverse packages in RStudio® Server',
                        'developmentTools': [
                            'rstudio',
                            'jupyterlab',
                            'notebook'
                        ],
                        'dockerImageNamespace': 'gigantum',
                        'dockerImageRepository': 'rstudio-server',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '87c90e7834-2019-07-19',
                        'icon': 'data:image/png;base64,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',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnV0LXJzdHVkaW8tc2VydmVyJjE=',
                        'languages': [
                            'R',
                            'python3'
                        ],
                        'license': 'MIT',
                        'name': 'R Tidyverse in RStudio® Server',
                        'osClass': 'ubuntu',
                        'osRelease': '18.04',
                        'packageManagers': [
                            'apt',
                            'pip',
                            'conda3'
                        ],
                        'readme': '''A Base containing R 3.6 and Tidyverse from the official CRAN PPA configured
for use in RStudio® Server.  A conda-managed JupyterLab is also installed, and
OpenBLAS is configured.

You should generally use Apt with `r-cran-<package name>` to quickly install
"package name" from CRAN. You can also use Docker snippets for approaches
like `install.packages` or `devtools::install_github`. Don't hesitate to use
the "discuss" link (in the lower-right "?" bubble in the app) if you\'d like
some guidance!

*RStudio® and the RStudio logo are registered trademarks of RStudio, Inc.*
''',
                        'tags': [
                            'ubuntu',
                            'rstats',
                            'rstudio'
                        ],
                        'url': None
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
snapshots['TestEnvironmentBaseImageQueries.test_get_available_base_images_pagination_reverse 2'] = {
    'data': {
        'availableBases': {
            'edges': [
                {
                    'cursor': 'MA==',
                    'node': {
                        'componentId': 'quickstart-jupyterlab',
                        'description': 'Data Science Quickstart using Jupyterlab, numpy, and Matplotlib. A great base for any analysis.',
                        'developmentTools': [
                            'jupyterlab'
                        ],
                        'dockerImageNamespace': 'gigantum',
                        'dockerImageRepository': 'python3-minimal',
                        'dockerImageServer': 'hub.docker.com',
                        'dockerImageTag': '1effaaea-2018-05-23',
                        'icon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                        'id': 'QmFzZUNvbXBvbmVudDpnaWdhbnR1bV9iYXNlLWltYWdlcy10ZXN0aW5nJnF1aWNrc3RhcnQtanVweXRlcmxhYiYy',
                        'languages': [
                            'python3'
                        ],
                        'license': 'MIT',
                        'name': 'Data Science Quickstart with JupyterLab',
                        'osClass': 'ubuntu',
                        'osRelease': '18.04',
                        'packageManagers': [
                            'apt',
                            'pip3'
                        ],
                        'readme': 'Empty for now',
                        'tags': [
                            'ubuntu',
                            'python3',
                            'jupyterlab'
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
