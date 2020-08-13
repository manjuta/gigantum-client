import os

import testutils
from testutils import TestTags
from testutils.graphql_helpers import create_py3_minimal_project


@TestTags("graphql")
def test_init_graphql(driver, *args, **kwargs):
    username = testutils.log_in(driver)
    testutils.GuideElements(driver).remove_guide()
    owner, project_title = create_py3_minimal_project(testutils.unique_project_name())
    driver.get(f"{os.environ['GIGANTUM_HOST']}/projects/{username}/{project_title}")
    overview_elts = testutils.OverviewElements(driver)
    overview_elts.project_description.wait_to_appear()

    assert "GraphQL" in overview_elts.project_description.find().text, "GraphQL not found in project description"
