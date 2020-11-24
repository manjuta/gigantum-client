import pytest
from client_app.helper.local_project_helper_utility import ProjectHelperUtility


@pytest.fixture()
def clean_up_project():
    """Remove containers and directory fixture."""
    yield
    ProjectHelperUtility().delete_local_project()
