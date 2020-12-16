import os
import logging

import docker
import selenium

import testutils


def test_delete_project(driver: selenium.webdriver, *args, **kwargs):
    """
    Test that deleting a project in Gigantum deletes its file path and Docker image.

    Args:
        driver
    """
    r = testutils.prep_py3_minimal_base(driver)
    username, project_name = r.username, r.project_name

    logging.info(f"Checking that project {project_name} file path exists")
    project_path = os.path.join(os.environ['GIGANTUM_HOME'], 'servers', testutils.current_server_id(),
                                username, username, 'labbooks', project_name)

    assert os.path.exists(project_path), \
        f"Project {project_name} should exist at file path {project_path}"

    logging.info(f"Checking that project {project_name} Docker image exists")
    dc = docker.from_env()
    project_img = []
    for img in dc.images.list():
        for t in img.tags:
            if 'gmlb-' in t and project_name in t:
                logging.info(f"Found project {project_name} Docker image tag {t}")
                project_img.append(img)

    assert len(project_img) == 1, f"Expected project {project_name} to have one Docker image tag"

    logging.info(f"Deleting project {project_name}")
    delete_project_elts = testutils.DeleteProjectElements(driver)
    delete_project_elts.delete_local_project(project_name)

    logging.info(f"Checking that project {project_name } file path and Docker image no longer exist")

    assert not os.path.exists(project_path), f"Deleted project {project_name} exists at {project_path}"

    project_img = []
    for img in dc.images.list():
        for t in img.tags:
            if "gmlb-" in t and project_name in t:
                logging.error(f"Deleted project {project_name} has Docker image tag {t}")
                project_img.append(img)

    assert len(project_img) == 0, \
        f"Deleted project {project_name} has Docker image {project_img[0]}"
