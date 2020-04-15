import os
RUNNING_ON_CI = os.environ.get('CIRCLE_BRANCH') is not None
BG_SKIP_TEST = RUNNING_ON_CI and os.environ.get('SKIP_BG_TESTS') is not None
BG_SKIP_MSG = "Skip background job tests on circleCI when not in `test-background-jobs` job"
