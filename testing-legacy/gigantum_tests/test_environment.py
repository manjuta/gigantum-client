import os
import logging
import time

import selenium
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

import testutils


def test_packages(driver: selenium.webdriver, *args, **kwargs):
    """
    Test that pip ,conda, and apt packages install successfully.

    Args:
        driver
    """
    r = testutils.prep_py3_minimal_base(driver)
    username, project_title = r.username, r.project_name
    pip_package_construct = ("construct", "2.9.45")
    conda_package_requests = ("requests", "2.22.0")
    apt_package_vim = "vim-tiny"

    # Install pip, conda, and apt packages
    env_elts = testutils.EnvironmentElements(driver)
    env_elts.open_add_packages_modal(username, project_title)
    env_elts.add_pip_package(pip_package_construct[0], pip_package_construct[1])
    env_elts.add_conda_package(conda_package_requests[0], conda_package_requests[1])
    env_elts.add_apt_package(apt_package_vim)
    env_elts.install_queued_packages()

    # Open JupyterLab and create Jupyter notebook
    project_control_elts = testutils.ProjectControlElements(driver)
    project_control_elts.launch_devtool("JupyterLab")
    project_control_elts.open_devtool_tab("JupyterLab")
    jupyterlab_elts = testutils.JupyterLabElements(driver)
    jupyterlab_elts.jupyter_notebook_button.wait_to_appear().click()
    time.sleep(5)
    logging.info("Running script to import packages and print package versions")
    package_script = "import construct\nimport requests\n" \
                     "print(construct.__version__,requests.__version__)"
    actions = ActionChains(driver)
    actions.move_to_element(jupyterlab_elts.code_input.wait_to_appear()) \
        .click(jupyterlab_elts.code_input.find()) \
        .send_keys(package_script) \
        .key_down(Keys.SHIFT).send_keys(Keys.ENTER).key_up(Keys.SHIFT).key_up(Keys.CONTROL) \
        .perform()
    jupyterlab_elts.code_output.wait_to_appear()

    # Get JupyterLab package versions
    logging.info("Extracting package versions from JupyterLab")
    environment_package_versions = [pip_package_construct[1], conda_package_requests[1]]
    jupyterlab_package_versions = jupyterlab_elts.code_output.find().text.split(" ")
    logging.info(f"Environment package version {environment_package_versions} \n "
                 f"JupyterLab package version {jupyterlab_package_versions}")

    assert environment_package_versions == jupyterlab_package_versions,\
        "Environment and JupyterLab package versions do not match"


def test_packages_requirements_file(driver: selenium.webdriver, *args, **kwargs):
    """
    Test that packages can be installed successfully using a requirements.txt file.

    Args:
        driver
    """
    r = testutils.prep_py3_minimal_base(driver)
    username, project_title = r.username, r.project_name

    # Open add packages modal
    env_elts = testutils.EnvironmentElements(driver)
    env_elts.open_add_packages_modal(username, project_title)
    env_elts.add_requirements_file_button.wait_to_appear().click()

    # Drag and drop requirements.txt
    env_elts.drag_drop_requirements_file_in_drop_zone()
    env_elts.install_queued_packages()
    project_control_elts = testutils.ProjectControlElements(driver)

    assert env_elts.package_info_table_version_one.find().text == "0.19", \
        "gigantum==0.19 package was not installed successfully since it is not visible in the UI"

    # Check that pip package was installed inside the container
    project_control_elts.start_stop_container_button.wait_to_appear().click()
    project_control_elts.container_status_running.wait_to_appear(30)
    container_pip_packages = env_elts.obtain_container_pip_packages(username, project_title)

    assert "gigantum==0.19" in container_pip_packages, \
        "gigantum==0.19 package was not installed successfully since it is not installed inside the container"


def test_package_removal_via_trash_can_button(driver: selenium.webdriver, *args, **kwargs):
    """
    Test that packages can be removed successfully via trash can button.

    Args:
        driver
    """
    r = testutils.prep_py3_minimal_base(driver)
    username, project_title = r.username, r.project_name
    pip_package = "gtmunit1"

    # Add pip package
    env_elts = testutils.EnvironmentElements(driver)
    env_elts.open_add_packages_modal(username, project_title)
    env_elts.add_pip_package(pip_package)
    env_elts.install_queued_packages()
    project_control_elts = testutils.ProjectControlElements(driver)

    # Check that pip package exists in the UI
    assert env_elts.package_info_table_version_one.find().is_displayed(), \
        f"{pip_package} package was not installed successfully since it is not visible in the UI"

    # Check that pip package was installed inside the container
    project_control_elts.start_stop_container_button.wait_to_appear().click()
    project_control_elts.container_status_running.wait_to_appear(30)
    container_pip_packages = env_elts.obtain_container_pip_packages(username, project_title)

    assert pip_package in container_pip_packages, \
        f"{pip_package} package was not installed successfully since it is not installed inside the container"

    # Stop container
    project_control_elts.start_stop_container_button.wait_to_appear().click()
    project_control_elts.container_status_stopped.wait_to_appear(30)
    # Delete package via trash can button
    env_elts.delete_package_via_trash_can_button(pip_package)

    env_elts.package_info_area.wait_to_appear(5)
    assert env_elts.package_info_area.find().text == "No packages have been added to this project", \
        f"{pip_package} package was not deleted successfully from the UI via trash can button"

    # Start container
    project_control_elts.start_stop_container_button.wait_to_appear().click()
    project_control_elts.container_status_running.wait_to_appear(30)
    # Check pip package is not installed inside container
    container_pip_packages = env_elts.obtain_container_pip_packages(username, project_title)

    assert pip_package not in container_pip_packages, \
        f"{pip_package} package still found inside the container after deletion via trash can button"


def test_package_removal_via_check_box_button(driver: selenium.webdriver, *args, **kwargs):
    """
    Test that packages can be removed successfully via check box button.

    Args:
        driver
    """
    # Create project
    r = testutils.prep_py3_minimal_base(driver)
    username, project_title = r.username, r.project_name
    pip_package = "gtmunit1"

    # Add pip package
    env_elts = testutils.EnvironmentElements(driver)
    env_elts.open_add_packages_modal(username, project_title)
    env_elts.add_pip_package(pip_package)
    env_elts.install_queued_packages(300)
    project_control_elts = testutils.ProjectControlElements(driver)

    # Check that pip package exists in the UI
    assert env_elts.package_info_table_version_one.find().is_displayed(), \
        f"{pip_package} package was not installed successfully since it is not visible in the UI"

    # Check that pip package was installed inside the container
    project_control_elts.start_stop_container_button.wait_to_appear().click()
    project_control_elts.container_status_running.wait_to_appear(30)
    container_pip_packages = env_elts.obtain_container_pip_packages(username, project_title)

    assert pip_package in container_pip_packages, \
        f"{pip_package} package was not installed successfully since it is not installed inside the container"

    # Stop container
    project_control_elts.start_stop_container_button.wait_to_appear().click()
    project_control_elts.container_status_stopped.wait_to_appear(30)
    # Delete package via check box button
    env_elts.delete_package_via_check_box_button(pip_package)

    env_elts.package_info_area.wait_to_appear(5)
    assert env_elts.package_info_area.find().text == "No packages have been added to this project", \
        f"{pip_package} package was not deleted successfully from the UI via check box button"

    # Start container
    project_control_elts = testutils.ProjectControlElements(driver)
    project_control_elts.start_stop_container_button.wait_to_appear().click()
    project_control_elts.container_status_running.wait_to_appear(30)
    # Check pip package is not installed inside container
    container_pip_packages = env_elts.obtain_container_pip_packages(username, project_title)

    assert pip_package not in container_pip_packages, \
        f"{pip_package} package still found inside the container after deletion via check box button"


def test_valid_custom_docker(driver: selenium.webdriver, *args, **kwargs):
    """
    Test valid custom Docker instructions.

    Args:
        driver
    """
    r = testutils.prep_py3_minimal_base(driver)
    username, project_title = r.username, r.project_name

    env_elts = testutils.EnvironmentElements(driver)
    env_elts.add_custom_docker_instructions(username, project_title,
                                            "RUN cd /tmp && "
                                            "git clone https://github.com/gigantum/confhttpproxy && "
                                            "cd /tmp/confhttpproxy && pip install -e.")
    project_control_elts = testutils.ProjectControlElements(driver)
    project_control_elts.container_status_stopped.wait_to_appear(60)

    container_status = project_control_elts.container_status_stopped.find().is_displayed()
    assert container_status, "Expected stopped container status"


def test_invalid_custom_docker(driver: selenium.webdriver, *args, **kwargs):
    """
    Test invalid custom Docker instructions.

    Args:
        driver
    """
    r = testutils.prep_py3_minimal_base(driver)
    username, project_title = r.username, r.project_name

    env_elts = testutils.EnvironmentElements(driver)
    env_elts.add_custom_docker_instructions(username, project_title, "RUN /bin/false")
    project_control_elts = testutils.ProjectControlElements(driver)
    project_control_elts.container_status_rebuild.wait_to_appear(60)

    container_status = project_control_elts.container_status_rebuild.find().is_displayed()
    assert container_status, "Expected rebuild container status"

    footer_notification_message_text = project_control_elts.footer_notification_message.find().text
    assert "Project failed to build" in footer_notification_message_text, \
        "Expected 'Project failed to build' in footer message"


# def test_sensitive_file_manager(driver: selenium.webdriver, *args, **kwargs):
#     """
#     Test sensitive file manager.
#
#     Args:
#         driver
#     """
#     r = testutils.prep_py3_minimal_base(driver)
#     username, project_title = r.username, r.project_name
#
#     # Get sensitive file information
#     logging.info("Getting sensitive file information for driver.py")
#     f = open("driver.py", "r")
#     sensitive_file_text = ""
#     for line in f:
#         sensitive_file_text += line
#     f.close()
#
#     # Add sensitive file in Environment tab
#     env_elts = testutils.EnvironmentElements(driver)
#     env_elts.add_sensitive_file(username, project_title,
#                                 f"{os.environ['HOME']}/gigantum-client/testing/driver.py", "mnt/labbook/code")
#
#     # Open JupyterLab and create Jupyter notebook
#     project_control_elts = testutils.ProjectControlElements(driver)
#     project_control_elts.launch_devtool("JupyterLab")
#     project_control_elts.open_devtool_tab("JupyterLab")
#     jupyterlab_elts = testutils.JupyterLabElements(driver)
#     jupyterlab_elts.jupyter_notebook_button.wait_to_appear().click()
#     time.sleep(5)
#
#     # Check that sensitive file information is the same in JupyterLab
#     logging.info("Checking sensitive file information for driver.py is the same in JupyterLab")
#     sensitive_file_script = "f = open('driver.py', 'r') \n" \
#                             "for line in f:\n" \
#                             "print(line.strip('\\n'))"
#     actions = ActionChains(driver)
#     actions.move_to_element(jupyterlab_elts.code_input.wait_to_appear()) \
#         .click(jupyterlab_elts.code_input.find()) \
#         .send_keys(sensitive_file_script) \
#         .key_down(Keys.SHIFT).send_keys(Keys.ENTER).key_up(Keys.SHIFT).key_up(Keys.CONTROL) \
#         .perform()
#
#     assert sensitive_file_text == jupyterlab_elts.code_output.text + "\n"
