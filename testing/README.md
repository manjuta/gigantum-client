
# Gigantum Client Test Harness

## Overview

This test harness is meant to run GraphQL queries and mutations against a Gigantum client container.
In the context of the test harness, this container is known as the "Container-Under-Test".

This harness is incomplete and much work remains. In general, this harness aims to:

1. Supplement unit tests inside the source for basic queries and mutations.
2. Use actual dev/prod infrastructure in-the-loop to characterize peformance.
3. Execute sequences/interactions to validate correctness and performance within designated bounds.
4. Fill a "gap" between unit testing and end-to-end system testing.

## Usage

Ensure a client app instance is running, then run tests...

```
    $ (virtualenv) ./runtests.sh <your-username> <your-user-token> <your-access-token>
```

Note! Retrieve your user token from your chrome cache (must login via web first).

Copy the value for `user_token` and `access_token` respectively from the Chrome dev tools menu.


