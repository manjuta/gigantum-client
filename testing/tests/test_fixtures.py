import pytest
from client_app.helper.local_project_helper_utility import ProjectHelperUtility


@pytest.fixture()
def clean_up_project():
    """Remove containers and directory fixture."""
    yield
    ProjectHelperUtility().delete_local_project()


@pytest.fixture()
def clean_up_remote_project():
    """Remove remote project directory"""
    project_details = {}
    yield project_details
    if project_details:
        ProjectHelperUtility().delete_remote_project(project_details['project_name'], project_details['driver'])
    else:
        raise Exception("Failed to set project details into remote project clean up fixture")
