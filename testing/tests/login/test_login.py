"""Test call for TestLogin"""
import pytest
from configuration.configuration import ConfigurationManager
from client_app.pages.landing.landing_page import LandingPage
from client_app.pages.project_listing.project_listing_page import ProjectListingPage
from framework.factory.models_enums.constants_enums import LoginUser


@pytest.mark.loginTest
class TestLogin:
    """Collection of test methods for login functionality."""

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
    def test_logout_success(self):
        """Test method to check the successful logout and re-login."""
        project_list = ProjectListingPage(self.driver)
        project_list.project_listing_component.profile_menu_click()
        project_list.project_listing_component.log_out()
        landing_page = LandingPage(self.driver, False)
        assert landing_page.landing_component.get_server_button_text() == "Gigantum Hub"
        log_in_page = landing_page.landing_component.load_log_in_page()
        assert log_in_page.sign_up_component.get_sign_up_title() == "Log In"
        log_in_page.log_in_component.click_not_existing_user()
        user_credentials = ConfigurationManager.getInstance().get_user_credentials(LoginUser.User1)
        project_list = log_in_page.login(user_credentials.user_name, user_credentials.password)
        assert project_list.project_listing_component.get_project_title() == "Projects"
