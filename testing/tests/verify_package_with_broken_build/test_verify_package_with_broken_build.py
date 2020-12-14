"""Test call for verifying package lookups work with a broken build"""
import pytest
from tests.helper.project_utility import ProjectUtility
from configuration.configuration import ConfigurationManager
from client_app.pages.landing.landing_page import LandingPage
from client_app.pages.package_listing.package_listing_page import PackageListingPage
from framework.factory.models_enums.constants_enums import LoginUser
from collections import namedtuple
from tests.constants_enums.constants_enums import ProjectConstants
from tests.test_fixtures import clean_up_project


@pytest.mark.verifyPackageWithBrokenBuildTest
class TestVerifyPackageWithBrokenBuild:
    """Includes test methods for basic project creation and verifying package lookups work with a broken build"""

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
    def test_verify_package_with_broken_build(self, clean_up_project):
        """Test method to verifying package lookups work with a broken build"""
        # Create project
        is_success_msg = ProjectUtility().create_project(self.driver)
        assert is_success_msg == ProjectConstants.SUCCESS.value, is_success_msg

        # Load Project Package Page
        package_list = PackageListingPage(self.driver)
        assert package_list is not None, "Could not load Project Listing Page"

        # Click on Environment Tab
        is_clicked = package_list.click_environment_button()
        assert is_clicked, "Could not click Environment tab"

        # Scroll window to bottom
        is_scrolled = package_list.scroll_window_to_bottom()
        assert is_scrolled, "Could not scrolled the window to bottom"

        # Click on Advanced configuration settings button
        is_clicked = package_list.click_advanced_configuration_settings()
        assert is_clicked, "Could not click advanced configuration settings"

        # Scroll to an element
        is_clicked = package_list.scroll_to_advanced_configuration()
        assert is_clicked, "Could not scroll to element"

        # Click on Edit dockerfile button
        is_clicked = package_list.click_edit_dockerfile_button()
        assert is_clicked, "Could not click edit dockerfile button"

        # Type command to docker text area
        is_typed = package_list.click_and_input_docker_text_area('RUN /bin/false')
        assert is_typed, "Could not click and type docker text area"

        # Click on save button
        is_clicked = package_list.click_save_button()
        assert is_clicked, "Could not click save button"

        # Monitor container status to go through stopped -> building
        is_status_changed = package_list.monitor_container_status("Building", 60)
        assert is_status_changed, "Could not get Building status"

        # Monitor container status to go through building -> stopped
        is_status_changed = package_list.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

        # Check for rebuild required
        is_checked = package_list.check_rebuild_required()
        assert is_checked, "Could not check rebuild required"

        # Scroll to an element
        is_clicked = package_list.scroll_to_add_package_button()
        assert is_clicked, "Could not scroll to element"

        # Click on Add Package button
        is_clicked = package_list.click_add_package()
        assert is_clicked, "Could not click Add Package"

        # Input package name
        is_package_title_typed = package_list.type_package_name("gtmunit1")
        assert is_package_title_typed, "Could not type package gtmunit1"

        # Click on Add button
        is_clicked = package_list.click_add()
        assert is_clicked, "Could not click Add button"

        # Choose apt package manager from dropdown list
        is_selected = package_list.choose_package_manager_from_dropdown('apt')
        assert is_selected, "Could not select apt package manager from drop down"

        # Input package name
        is_package_title_typed = package_list.type_package_name("wget")
        assert is_package_title_typed, "Could not type package wget"

        # Click on Add button
        is_clicked = package_list.click_add()
        assert is_clicked, "Could not click Add button"

        # Monitor package list status
        is_status_changed = package_list.monitor_package_list_status("2 added", 60)
        assert is_status_changed, "Could not get the package added status"

        # Click on Install all button
        is_clicked = package_list.click_install_all_packages()
        assert is_clicked, "Could not click Install all"

        # Monitor appearance of build modal window
        is_found = package_list.monitor_build_modal(60)
        assert is_found, "Could not find the build model"

        # Check for build model fail
        is_checked = package_list.check_build_modal_fail()
        assert is_checked, "Could not check build modal fail"

        # Click modal close button
        is_closed = package_list.click_modal_close_button()
        assert is_closed, "Could not click modal close button"

        # Monitor container status to go through building -> stopped
        is_status_changed = package_list.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

        # Scroll to an element
        is_clicked = package_list.scroll_to_advanced_configuration()
        assert is_clicked, "Could not scroll to element"

        # Click on Edit dockerfile button
        is_clicked = package_list.click_edit_dockerfile_button()
        assert is_clicked, "Could not click edit dockerfile button"

        # Clear docker text area
        is_cleared = package_list.clear_docker_text_area()
        assert is_cleared, "Could not clear docker text area"

        # Click on save button
        is_clicked = package_list.click_save_button()
        assert is_clicked, "Could not click save button"

        # Monitor container status to go through stopped -> building
        is_status_changed = package_list.monitor_container_status("Building", 60)
        assert is_status_changed, "Could not get Building status"

        # Monitor container status to go through building -> stopped
        is_status_changed = package_list.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

        # Check for success build
        is_succeed = package_list.check_rebuild_required()
        assert not is_succeed, "Build not succeed"

        # Scroll to an element
        is_clicked = package_list.scroll_to_add_package_button()
        assert is_clicked, "Could not scroll to element"

        # Verify package and it's version
        package = namedtuple('package', ('name', 'version'))
        package_gtmunit1 = package("gtmunit1", "0.12.4")
        is_verified = package_list.check_package(package_gtmunit1)
        assert is_verified, "Could not verify package gtmunit1"

        # Verify package name
        package_wget = package("wget", "")
        is_verified = package_list.check_package(package_wget)
        assert is_verified, "Could not verify package wget"

        # Open Jupyter_lab and verify packages and environment variable
        commands = namedtuple('command', ('command_text', 'output', 'error_message'))
        gtmunit1_grep_command = commands(['pip freeze | grep gtmunit'], ['gtmunit1==0.12.4'],
                                         'Verification of package failed')
        wget_command = commands(['!which wget'], ['/usr/bin/wget'], 'Verification of wget failed')
        verification_message = ProjectUtility().verify_command_execution(self.driver, [gtmunit1_grep_command,
                                                                                       wget_command])
        assert verification_message == ProjectConstants.SUCCESS.value, verification_message

