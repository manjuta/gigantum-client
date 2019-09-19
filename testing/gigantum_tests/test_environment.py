import logging
import time

import selenium
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

import testutils
import os


def test_packages(driver: selenium.webdriver, *args, **kwargs):
    """
    Test that pip ,conda, and apt packages install successfully.

    Args:
        driver
    """
    # TODO : Find a quick way to verify vim is usable in Jupyterlab

    # Create project
    r = testutils.prep_py3_minimal_base(driver)
    username, project_title = r.username, r.project_name

    # Adding pip apt, conda, and apt packages
    env_elts = testutils.EnvironmentElements(driver)
    env_elts.open_add_packages_window()
    pandas_version = '0.24.0'
    numpy_version = '1.16.0'
    time.sleep(1)
    env_elts.add_pip_package("pandas", pandas_version)
    env_elts.add_conda_package("numpy", numpy_version)
    env_elts.add_apt_package("vim")

    # Install all packages added to installation queue
    env_elts.install_queued_packages(300)
    environment_package_versions = [pandas_version, numpy_version]

    # Open JupyterLab and create Jupyter notebook
    project_control = testutils.ProjectControlElements(driver)
    project_control.container_status_stopped.wait(120)
    project_control.launch_devtool('JupyterLab')
    jupyterlab_elts = testutils.JupyterLabElements(driver)
    jupyterlab_elts.jupyter_notebook_button.wait().click()
    time.sleep(5)
    logging.info("Running script to import packages and print package versions")
    package_script = "import pandas\nimport numpy\n" \
                     "print(pandas.__version__,numpy.__version__)"
    actions = ActionChains(driver)
    actions.move_to_element(jupyterlab_elts.code_input.find()) \
        .click(jupyterlab_elts.code_input.find()) \
        .send_keys(package_script) \
        .key_down(Keys.SHIFT).send_keys(Keys.ENTER).key_up(Keys.SHIFT).key_up(Keys.CONTROL) \
        .perform()
    time.sleep(3)

    # Get JupyterLab package versions
    logging.info("Extracting package versions from JupyterLab")
    jupyterlab_package_output = jupyterlab_elts.code_output.find().text.split(" ")
    jupyterlab_package_versions = jupyterlab_package_output
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
    # Create project
    r = testutils.prep_py3_minimal_base(driver)
    username, project_title = r.username, r.project_name

    # Open packages window
    env_elts = testutils.EnvironmentElements(driver)
    env_elts.open_add_packages_window()
    env_elts.add_requirements_file_button.find().click()

    # Drag and drop requirements.txt
    file_browser_elts = testutils.FileBrowserElements(driver)
    file_browser_elts.drag_drop_requirements_file_in_drop_zone()
    env_elts.install_queued_packages(300)
    project_control_elts = testutils.ProjectControlElements(driver)
    project_control_elts.close_notification_menu_button.find().click()

    assert env_elts.package_info_table_version_one.contains_text("0.19"), \
        "gigantum==0.19 package was not installed successfully since it is not visible in the UI"

    # Check that pip package was installed inside the container
    project_control_elts.start_stop_container_button.find().click()
    project_control_elts.container_status_running.wait(30)
    container_pip_packages = env_elts.obtain_container_pip_packages(username, project_title)

    assert "gigantum==0.19" in container_pip_packages, \
        "gigantum==0.19 package was not installed successfully since it is not installed inside the container"


def test_package_removal_via_trash_can_button(driver: selenium.webdriver, *args, **kwargs):
    """
    Test that packages can be removed successfully via trash can button.

    Args:
        driver
    """
    # Create project
    r = testutils.prep_py3_minimal_base(driver)
    username, project_title = r.username, r.project_name
    package = "gigantum"

    # Add pip package
    env_elts = testutils.EnvironmentElements(driver)
    env_elts.open_add_packages_window()
    time.sleep(1)
    env_elts.add_pip_package(package)
    env_elts.install_queued_packages(300)
    project_control_elts = testutils.ProjectControlElements(driver)
    project_control_elts.close_notification_menu_button.find().click()

    # Check that pip package exists in the UI
    assert env_elts.package_info_table_version_one.find().is_displayed(), \
        f"{package} package was not installed successfully since it is not visible in the UI"

    # Check that pip package was installed inside the container
    project_control_elts.start_stop_container_button.find().click()
    project_control_elts.container_status_running.wait(30)
    container_pip_packages = env_elts.obtain_container_pip_packages(username, project_title)

    assert package in container_pip_packages, \
        f"{package} package was not installed successfully since it is not installed inside the container"

    # Stop container
    project_control_elts.start_stop_container_button.find().click()
    project_control_elts.container_status_stopped.wait()
    # Delete package via trash can button
    env_elts.delete_package_via_trash_can_button(package)

    assert env_elts.check_if_packages_is_empty(), \
        f"{package} package was not deleted successfully from the UI via trash can button"

    # Start container
    project_control_elts.start_stop_container_button.find().click()
    project_control_elts.container_status_running.wait(30)
    # Check pip package is not installed inside container
    container_pip_packages = env_elts.obtain_container_pip_packages(username, project_title)

    assert package not in container_pip_packages, \
        f"{package} package still found inside the container after deletion via trash can button"


def test_package_removal_via_check_box_button(driver: selenium.webdriver, *args, **kwargs):
    """
    Test that packages can be removed successfully via check box button.

    Args:
        driver
    """
    # Create project
    r = testutils.prep_py3_minimal_base(driver)
    username, project_title = r.username, r.project_name
    package = "gtmunit1"

    # Add pip package
    env_elts = testutils.EnvironmentElements(driver)
    env_elts.open_add_packages_window()
    time.sleep(1)
    env_elts.add_pip_package(package)
    env_elts.install_queued_packages(300)
    project_control_elts = testutils.ProjectControlElements(driver)
    project_control_elts.close_notification_menu_button.find().click()

    # Check that pip package exists in the UI
    assert env_elts.package_info_table_version_one.find().is_displayed(), \
        f"{package} package was not installed successfully since it is not visible in the UI"

    # Check that pip package was installed inside the container
    project_control_elts.start_stop_container_button.find().click()
    project_control_elts.container_status_running.wait(30)
    container_pip_packages = env_elts.obtain_container_pip_packages(username, project_title)

    assert package in container_pip_packages, \
        f"{package} package was not installed successfully since it is not installed inside the container"

    # Stop container
    project_control_elts.start_stop_container_button.find().click()
    project_control_elts.container_status_stopped.wait()

    # Delete package via check box button
    env_elts.delete_package_via_check_box_button(package)

    assert env_elts.check_if_packages_is_empty(), \
        f"{package} package was not deleted successfully from the UI via check box button"

    # Start container
    project_control_elts = testutils.ProjectControlElements(driver)
    project_control_elts.start_stop_container_button.find().click()
    project_control_elts.container_status_running.wait(30)
    # Check pip package is not installed inside container
    container_pip_packages = env_elts.obtain_container_pip_packages(username, project_title)

    assert package not in container_pip_packages, \
        f"{package} package still found inside the container after deletion via check box button"


def test_valid_custom_docker(driver: selenium.webdriver, *args, **kwargs):
    """
    Test valid custom Docker instructions.

    Args:
        driver
    """
    # Create project
    r = testutils.prep_py3_minimal_base(driver)
    username, project_name = r.username, r.project_name
    env_elts = testutils.EnvironmentElements(driver)
    env_elts.add_custom_docker_instructions("RUN cd /tmp && "
                                            "git clone https://github.com/gigantum/confhttpproxy && "
                                            "cd /tmp/confhttpproxy && pip install -e.")
    proj_elements = testutils.ProjectControlElements(driver)
    proj_elements.container_status_stopped.wait(60)

    container_status = proj_elements.container_status_stopped.is_displayed()
    assert container_status, "Expected stopped container status"


def test_invalid_custom_docker(driver: selenium.webdriver, *args, **kwargs):
    """
    Test invalid custom Docker instructions.

    Args:
        driver
    """
    # Create project
    r = testutils.prep_py3_minimal_base(driver)
    username, project_name = r.username, r.project_name
    env_elts = testutils.EnvironmentElements(driver)
    env_elts.add_custom_docker_instructions("RUN /bin/false")
    wait = WebDriverWait(driver, 90)
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".flex>.Rebuild")))

    container_status = driver.find_element_by_css_selector(".flex>.Rebuild").is_displayed()
    assert container_status, "Expected rebuild container status"

    cloud_elts = testutils.CloudProjectElements(driver)
    footer_message_text = cloud_elts.sync_cloud_project_message.find().text
    assert "Project failed to build" in footer_message_text, "Expected 'Project failed to build' in footer message"


def test_sensitive_file_manager(driver: selenium.webdriver, *args, **kwargs):
    """
    Test sensitive file manager.

    Args:
        driver
    """
    r = testutils.prep_py3_minimal_base(driver)
    username, project_name = r.username, r.project_name
    env_elts = testutils.EnvironmentElements(driver)
    env_elts.add_sensitive_file(f'{os.environ["HOME"]}/gigantum-client/testing/driver.py','mnt/labbook/code')
    project_control = testutils.ProjectControlElements(driver)
    project_control.launch_devtool('JupyterLab')
    jupyterlab_elts = testutils.JupyterLabElements(driver)
    jupyterlab_elts.jupyter_notebook_button.wait(60)
    time.sleep(1)
    jupyterlab_elts.jupyter_notebook_button.click()
    logging.info("Parsing selected file")
    f = open("driver.py","r")
    driver_text = ""
    for line in f:
        driver_text+=line
    f.close()
    logging.info("Printing file info in jupyter")
    print_file = 'f = open("driver.py","r") \n'\
                'for line in f:\n' \
                'print(line.strip("\\n"))'
    time.sleep(1)
    actions = ActionChains(driver)
    actions.move_to_element(jupyterlab_elts.code_input.find()) \
        .click(jupyterlab_elts.code_input.find()) \
        .send_keys(print_file) \
        .key_down(Keys.SHIFT).send_keys(Keys.ENTER).key_up(Keys.SHIFT).key_up(Keys.CONTROL) \
        .perform()

    logging.info("Reading file info from jupyter")
    output = jupyterlab_elts.code_output

    assert output.text+"\n" == driver_text
