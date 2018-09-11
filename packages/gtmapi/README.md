# LabManager GraphQL API

[![CircleCI](https://circleci.com/gh/gigantum/labmanager-service-labbook.svg?style=svg&circle-token=35da44b7cf8ad0cdf2821db40ed11d61287fbdfe)](https://circleci.com/gh/gigantum/labmanager-service-labbook)
[![Coverage Status](https://coveralls.io/repos/github/gigantum/labmanager-service-labbook/badge.svg?t=beG2z0)](https://coveralls.io/github/gigantum/labmanager-service-labbook)

The Gigantum LabManager GraphQL API provides all services to manage and
manipulate LabBooks.  During development, this repository will generally be
checked out as a submodule of [gtm](https://github.com/gigantum/gtm).
High-level instructions are available in that repository.

## Installation

The LabManager API is Python3 only.

The `gtm` cli tool provides the necessary context to run this service in a
development context. Per the above, please clone this module as a submodule of
[gtm](https://github.com/gigantum/gtm).

## Running the dev server

This service will be automatically started by the `Run Dev API server` task
configured in PyCharm via `python gtm.py developer setup` (run from the root of
the `gtm` repository). If, however, you are running from the command line, this
service must be manually started by entering the docker container. Again, see
the [gtm](https://github.com/gigantum/gtm) repository for full details.

Once the service is running, you can navigate your browser to
[http://127.0.0.1:10001/labbook/](http://127.0.0.1:10001/labbook/) and you
should see the GraphQL interface.

## Dumping the GraphQL Schema

To dump the GraphQL schema to a JSON file, run the `blueprint.py` file from a
`developer attach` session (again, see [gtm](https://github.com/gigantum/gtm)
for details).

The path to the schema.json file will be printed to your console.

## Contributing

Gigantum uses the [Developer Certificate of Origin](https://developercertificate.org/). 
This is lightweight approach that doesn't require submission and review of a
separate contributor agreement.  Code is signed directly by the developer using
facilities built into git.

Please see [`docs/contributing.md`  in the gtm
repository](https://github.com/gigantum/gtm/tree/integration/docs/contributing.md).

## Credits

TODO
