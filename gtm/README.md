# gtm

A command line interface tool for developing, testing, and deploying the Gigantum client application, 
which is intended to run as a [Docker container](https://www.docker.com/what-container).

If you are simply interested in *using* Gigantum, please follow our [download
instructions](https://gigantum.com/download) and visit the user docs at
[http://docs.gigantum.com](http://docs.gigantum.com).

Tooling is included to ease setup of
[PyCharm](https://www.jetbrains.com/pycharm/) for remote Docker debugging.

Below are rough and ready instructions on how to develop on the application.
Further information is provided in the `docs/` directory. In particular, if you
are interested in contributing back to the Gigantum codebase, please read `docs/contributing.md`.

## Installation

`gtm` is Python3 only, and has a few dependencies that must be installed. Its
recommended that you create a virtualenv to install `gtm`.

1. Install Docker

   The `gtm` tool requires Docker and Docker Compose on your host machine to
   build and launch images. Follow Docker's instructions for your OS.

2. Install Git LFS
   
   Git LFS is required when running the client in development mode. Since the repository will get mounted into the 
   client container for debugging, `git-lfs` gets initialized. Even though there are no files in this repository 
   currently using Git LFS, if you try to push from your host after this without `git-lfs` installed you will get an 
   error. Follow the [instructions](https://help.github.com/en/articles/installing-git-large-file-storage) for your OS.

3. Install Python 3

   If your OS does not already have Python3 installed, you'll have to install
   it. For example:

   OSX
   ```
   $ brew install python3
   ```

   Windows
   ```
   PS> choco install python3
   ```

4. Create a virtualenv (strongly recommended)

   Using [virtualenvwrapper](https://virtualenvwrapper.readthedocs.io/en/latest/):

   ```
   $ mkvirtualenv --python=python3 gtm
   ```

   Alternatively, if you are using Anaconda or Miniconda, you could use:

   ```
   $ conda create -n gtm python=3
   ```

5. Install `gtm` package from the `gigantum-client` repository
    
   `gigantum-client` is a monorepo, containing all of the code, packages, data, and tooling required to build the
   Gigantum Client container. 
   
   First, clone `gigantum-client`. Branches to focus on: 
   - `master` branch will be the last public release
   - `integration` branch will be the latest working updates
   
   Next, install the `gtm` python package:
   
   ```
   cd gigantum-client/gtm
   pip install .
   ```
    
   This will install the package and create an executable script `gtm`. This let's you use the python package directly
   from you terminal (e.g. `gtm client -v build`)
   

## Usage

Use ```gtm -h``` to print the help contents for the tool.

The basic command structure is:

```
gtm <optional args> <component> <command>
```

Where the supported system **components** are:

- **client** - tooling for building, publishing, and using "production" configured Client containers
- **dev** - tooling for building, publishing, and using developer containers
- **demo** - tooling for building and publishing the container for running a public demo
- **circleci** - tooling for building and publishing CircleCI images for unit tests


While mostly self-explanatory, be sure to run `gtm dev setup` first to configure your environment. This will write
a small config file to `~/.gtm/config` that is used to render files as needed during build and launch containers
with the right commands (e.g. windows vs. macOS)


## Testing

The `gtm` tool itself has unit tests written in pytest. To run them, simply
execute pytest

```
$ workon gtm  # assuming you're using virtualenvwrapper
$ cd gtm
$ pytest
```
