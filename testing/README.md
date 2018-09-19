
# Gigantum Client Test Harness

## Usage

First, install the assocated `sgqlc` package (Simple GraphQL Client)

```
    $ (virtualenv) cd sgqlc
    $ (virtualenv) pip install -e .
    $ (virtualenv) cd ..
```

Now, ensure a client app instance is running, then run tests...

```
    $ (virtualenv) ./runtests.sh <your-username> <your-user-token>
```

Note! Retrieve your user token from your chrome cache (must login via web first)

