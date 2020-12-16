"""Test call for Add Package using custom docker snippets"""
import pytest
from tests.helper.project_utility import ProjectUtility
from configuration.configuration import ConfigurationManager
from client_app.pages.landing.landing_page import LandingPage
from client_app.pages.package_listing.package_listing_page import PackageListingPage
from framework.factory.models_enums.constants_enums import LoginUser
from collections import namedtuple
from tests.constants_enums.constants_enums import ProjectConstants
from tests.test_fixtures import clean_up_project


@pytest.mark.addPackageFromDockerSnippets
class TestAddPackageUsingDockerSnippets:
    """Includes test methods for basic project creation add package using custom docker snippets"""

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
    def test_add_package_using_docker_snippets(self, clean_up_project):
        """Test method to create a package using custom docker snippets"""
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
        is_typed = package_list.click_and_input_docker_text_area('RUN pip install gtmunit1==0.12.4 \nENV TEST=1')
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

        # Open Jupyter_lab and verify packages and environment variable
        commands = namedtuple('command', ('command_text', 'output', 'error_message'))

        gtmunit1_grep_command = commands(['pip freeze | grep gtmunit'], ['gtmunit1==0.12.4'],
                                         'Verification of package failed')
        env_var_command = commands(['import os', 'os.environ.get("TEST")'], ["'1'"],
                                   'Verification of environment variable failed')
        verification_message = ProjectUtility().verify_command_execution(self.driver, [gtmunit1_grep_command,
                                                                                       env_var_command])
        assert verification_message == ProjectConstants.SUCCESS.value, verification_message





