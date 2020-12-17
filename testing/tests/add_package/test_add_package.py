"""Test call for Add Package"""
import pytest
from tests.helper.project_utility import ProjectUtility
from configuration.configuration import ConfigurationManager
from client_app.pages.landing.landing_page import LandingPage
from client_app.pages.package_listing.package_listing_page import PackageListingPage
from framework.factory.models_enums.constants_enums import LoginUser
from collections import namedtuple
from tests.constants_enums.constants_enums import ProjectConstants
from tests.test_fixtures import clean_up_project


@pytest.mark.addPackageTest
class TestAddPackage:
    """Includes test methods for basic project creation, and its dependent tests"""

    @pytest.mark.run(order=1)
    def test_log_in_success(self):
        """ Test method to check the successful log-in."""
        landing_page = LandingPage(self.driver)
        assert landing_page.landing_component.get_server_button_text() == "Gigantum Hub"
        log_in_page = landing_page.landing_component.load_log_in_page()
        assert log_in_page.sign_up_component.get_sign_up_title() == "Sign Up"
        user_credentials = ConfigurationManager.getInstance().get_user_credentials(LoginUser.User1)
        log_in_page.sign_up_component.move_to_log_in_tab()
        project_list = log_in_page.login(user_credentials.user_name, user_credentials.password)
        assert project_list.project_listing_component.get_project_title() == "Projects"

    @pytest.mark.depends(on=['test_log_in_success'])
    def test_add_package(self, clean_up_project):
        """Test method to create a package."""
        # Create project
        is_success_msg = ProjectUtility().create_project(self.driver)
        assert is_success_msg == ProjectConstants.SUCCESS.value, is_success_msg

        # Load Project Package Page
        package_list = PackageListingPage(self.driver)
        assert package_list is not None, "Could not load Project Listing Page"

        # Click on Environment Tab
        is_clicked = package_list.click_environment_button()
        assert is_clicked, "Could not click Environment tab"

        # Get package body text
        package_body_text = package_list.get_package_body_text()
        assert package_body_text == "No packages have been added to this project", "Package body text incorrect"

        # Click on Add Package button
        is_clicked = package_list.click_add_package()
        assert is_clicked, "Could not click Add Package"

        # Input package name
        is_package_title_typed = package_list.type_package_name("gtmunit1")
        assert is_package_title_typed, "Could not type package title"

        # Click on Add button
        is_clicked = package_list.click_add()
        assert is_clicked, "Could not click Add button"

        # Monitor package list status
        is_status_changed = package_list.monitor_package_list_status("1 added", 60)
        assert is_status_changed, "Could not get the package added status"

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

        # Monitor package list status
        is_status_changed = package_list.monitor_package_list_status("2 added", 60)
        assert is_status_changed, "Could not get the package added status"

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

        commands = namedtuple('command', ('command_text', 'output', 'error_message'))
        gtmunit_grep_command = commands(['pip freeze | grep gtmunit'], ['gtmunit1==0.12.4', 'gtmunit2==2.0'],
                                        'Verification of package failed')
        verification_message = ProjectUtility().verify_command_execution(self.driver, [gtmunit_grep_command])
        assert verification_message == ProjectConstants.SUCCESS.value, verification_message

        # Upgrade the packages
        self.update_package(package_list)

        # Open Jupyter_lab and verify packages
        commands = namedtuple('command', ('command_text', 'output', 'error_message'))
        gtmunit_grep_command = commands(['pip freeze | grep gtmunit'], ['gtmunit1==0.12.4', 'gtmunit2==12.2'],
                                        'Verification of package failed')
        verification_message = ProjectUtility().verify_command_execution(self.driver, [gtmunit_grep_command])
        assert verification_message == ProjectConstants.SUCCESS.value, verification_message

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

