import os
import logging
import time

import testutils
from testutils import TestTags
from testutils.graphql_helpers import create_py3_minimal_project, list_local_projects


@TestTags('graphql')
def test_time_list_local_projects(driver, *args, **kwargs):
    testutils.log_in(driver)
    testutils.GuideElements(driver).remove_guide()
    driver.get(f"{os.environ['GIGANTUM_HOST']}/api/version")
    t0 = time.time()
    results = list_local_projects()
    tList = time.time() - t0
    logging.warning(f"Listed {len(results)} projects in {tList:.2f}sec")
