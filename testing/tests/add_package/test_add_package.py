"""Test call for Add Package"""
import pytest
import random
from configuration.configuration import ConfigurationManager
from client_app.pages.landing.landing_page import LandingPage
from client_app.pages.project_listing.project_listing_page import ProjectListingPage
from client_app.pages.package_listing.package_listing_page import PackageListingPage
from client_app.pages.jupyter_lab.jupyter_lab_page import JupyterLabPage
from framework.factory.models_enums.constants_enums import LoginUser
from collections import namedtuple
from tests.test_fixtures import clean_up_project


@pytest.mark.addPackageTest
class TestAddPackage:
    """Includes test methods for basic project creation, and its dependent tests"""

    @pytest.mark.run(order=1)
    def test_log_in_success(self):
        """ Test method to check the successful log-in."""
        landing_page = LandingPage(self.driver)
        assert landing_page.landing_component.get_login_button_text() == "Sign Up or Log In"
        log_in_page = landing_page.landing_component.load_log_in_page()
        assert log_in_page.sign_up_component.get_sign_up_title() == "Sign Up"
        user_credentials = ConfigurationManager.getInstance().get_user_credentials(LoginUser.User1)
        log_in_page.sign_up_component.move_to_log_in_tab()
        project_list = log_in_page.login(user_credentials.user_name, user_credentials.password)
        assert project_list.project_listing_component.get_project_title() == "Projects"

    @pytest.mark.depends(on=['test_log_in_success'])
    def test_add_package(self, clean_up_project):
        """Test method to create a package."""

        # Create a project
        self.create_project()

        # Load Project Package Page
        package_list = PackageListingPage(self.driver)
        assert package_list is not None, "Could not load Project Listing Page"

        # Click on Environment Tab
        is_clicked = package_list.click_environment_button()
        assert is_clicked, "Could not click Environment tab"

        # Get package body text
        package_body_text = package_list.get_package_body_text()
        assert package_body_text == "No packages have been added to this project"

        # Click on Add Package button
        is_clicked = package_list.click_add_package()
        assert is_clicked, "Could not click Add Package"

        # Input package name
        is_package_title_typed = package_list.type_package_name("gtmunit1")
        assert is_package_title_typed, "Could not type package title"

        # Click on Add button
        is_clicked = package_list.click_add()
        assert is_clicked, "Could not click Add button"

        # Verify package and it's version
        package = namedtuple('package', ('name', 'version'))
        package_gtmunit1 = package("gtmunit1", "0.12.4")
        is_verified = package_list.verify_packages(package_gtmunit1)
        assert is_verified, "Could not verify package and version"

        # Input package name and version
        is_package_title_version_typed = package_list.type_package_name_and_version("gtmunit2", "2.0")
        assert is_package_title_version_typed, "Could not type package title"

        # Click on Add button
        is_clicked = package_list.click_add()
        assert is_clicked, "Could not click Add button"

        # Verify package and it's version
        package_gtmunit2 = package("gtmunit2", "2.0")
        is_verified = package_list.verify_packages(package_gtmunit2)
        assert is_verified, "Could not verify package and version"

        # Click on Install all button
        is_clicked = package_list.click_install_all_packages()
        assert is_clicked, "Could not click Install all"

        # Monitor appearance of build modal window
        is_found = package_list.monitor_build_modal(60)
        assert is_found, "Could not found the build model"

        # Monitor closing of build model window
        is_closed = package_list.check_build_modal_closed(60)
        assert is_closed, "Could not close the build modal"

        # Monitor container status to go through building -> stopped
        is_status_changed = package_list.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

        # Verify all package and it's version
        is_verified = package_list.verify_package_listing([package_gtmunit1, package_gtmunit2])
        assert is_verified, "Could not verify packages"

        # Open Jupyter_lab and verify packages
        self.verify_package_version(['gtmunit1==0.12.4', 'gtmunit2==2.0'])

        # Upgrade the packages
        self.update_package(package_list)

        # Open Jupyter_lab and verify packages
        self.verify_package_version(['gtmunit1==0.12.4', 'gtmunit2==12.2'])

    def create_project(self) -> None:
        """Logical separation of create package functionality"""
        # Load Project Listing Page
        project_list = ProjectListingPage(self.driver)
        assert project_list is not None, "Could not load Project Listing Page"

        # Closes the guide
        self.close_guide(project_list)

        # Click on "Create New"
        is_clicked = project_list.click_create_button()
        assert is_clicked, "Could not click Create New"

        # Enter project title-(unique random name) and description
        # UUID is not given now, since it creates big string
        # This can be changed along with upcoming  text cases
        project_title = f"p-{str(random.random())}"
        project_title = project_title.replace(".", "")
        is_project_title_typed = project_list.type_project_title(project_title)
        is_project_desc_typed = project_list.type_new_project_desc_textarea(f"{project_title} -> Description ")
        assert is_project_title_typed, "Could not type project title"
        assert is_project_desc_typed, "Could not type project description"

        # Click "Continue"
        is_submitted = project_list.click_submit_button()
        assert is_submitted, "Could not click Continue button to create new project"

        # Select the "Python3 Minimal" Base
        is_base_option_clicked = project_list.click_python3_minimal_stage()
        assert is_base_option_clicked, "Could not click option-python3_minimal_stage"

        # Click "Create Project"
        is_submitted = project_list.click_submit_button()
        assert is_submitted, "Could not click Create Project button after Base select"

        # Monitor container status to go to building state
        is_status_changed = project_list.monitor_container_status("Building", 60)
        assert is_status_changed, "Could not get Building status"

        # Monitor container status to go through building -> stopped state
        is_status_changed = project_list.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

        # Click on container status button to start container
        is_clicked = project_list.click_container_status()
        assert is_clicked, "Could not click container status"

        # Monitor container status to go through stopped -> running
        project_list.move_to_element()
        is_status_changed = project_list.monitor_container_status("Running", 60)
        assert is_status_changed, "Could not get Running status"

        # Click on container status button to stop container
        is_clicked = project_list.click_container_status()
        assert is_clicked, "Could not click container status"

        # Monitor container status to go through running -> stopped
        project_list.move_to_element()
        is_status_changed = project_list.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

    def update_package(self, package_list) -> None:
        """Logical separation of update package functionality

        Args:
            package_list: The page with UI elements
        """
        # Check package update
        is_checked = package_list.check_package_update('gtmunit1', 'Up to date')
        assert is_checked, "Could not check package update"

        # Check package update
        is_checked = package_list.check_package_update('gtmunit2', 'Update Package')
        assert is_checked, "Could not check package update"

        # Click on Update Package
        is_clicked = package_list.click_update_package()
        assert is_clicked, "Could not click Update Package"

        # Monitor container status to go through building -> stopped
        is_status_changed = package_list.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

        # Verify all package and it's version
        package = namedtuple('package', ('name', 'version'))
        package_gtmunit1 = package("gtmunit1", "0.12.4")
        package_gtmunit2 = package("gtmunit2", "12.2")
        is_verified = package_list.verify_package_listing([package_gtmunit1, package_gtmunit2])
        assert is_verified, "Could not verify packages"

        # Check for package update
        is_checked = package_list.check_package_update('gtmunit1', 'Up to date')
        assert is_checked, "Could not check package update"

        # Check for package update
        is_checked = package_list.check_package_update('gtmunit2', 'Up to date')
        assert is_checked, "Could not check package update"

    def verify_package_version(self, packages) -> None:
        """ Logical separation of verify package using jupyter

        Args:
            packages: The page with UI elements
        """
        # Load Project Package Page
        jupyter_lab_page = JupyterLabPage(self.driver)
        assert jupyter_lab_page is not None, "Could not load Project Listing Page"

        # Check package installation using jupyter
        jupyter_lab_page.click_jupyterlab_div()

        # Wait for new tab to open with new url
        is_url_loaded = jupyter_lab_page.wait_for_url_in_new_tab("/lab", 1, 60)
        assert is_url_loaded, "Could not open new window"

        # Click Python3 under notebook
        is_clicked = jupyter_lab_page.click_python3_notebook()
        assert is_clicked, "Could not click python3 under notebook"

        command_typed = jupyter_lab_page.type_command("pip freeze | grep gtmunit")
        assert command_typed, "Could not type the commands"

        # Click run cell to run the command
        is_clicked = jupyter_lab_page.click_run_cell()
        assert is_clicked, "Could not click run for command"

        # Checks packages_and_version and close tab
        is_package_correct = jupyter_lab_page.check_packages_version(packages)
        assert is_package_correct, "Verification of installed package fails"
        jupyter_lab_page.close_tab("/lab", 0)

        # Click on container status button to stop container
        is_clicked = jupyter_lab_page.click_container_status()
        assert is_clicked, "Could not click container status"

        # Monitor container status to go through running -> stopped
        jupyter_lab_page.move_to_element()
        is_status_changed = jupyter_lab_page.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

    def close_guide(self, project_list) -> None:
        """ Logical separation of closing the guide after log in

        Args:
            project_list: The page with UI elements
        """
        is_guide_active = project_list.is_active_helper_guide_slider()
        if is_guide_active:
            is_clicked = project_list.click_got_it_button()
            assert is_clicked, "Could not click got it button"

            is_clicked = project_list.click_helper_guide_slider()
            assert is_clicked, "Could not click helper guide slider"

            is_clicked = project_list.click_helper_close_button()
            assert is_clicked, "Could not click helper close button"
