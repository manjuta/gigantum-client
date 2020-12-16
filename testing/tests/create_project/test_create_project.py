"""Test call for Basic Create Project"""
import pytest
import random
from configuration.configuration import ConfigurationManager
from client_app.pages.landing.landing_page import LandingPage
from client_app.pages.project_listing.project_listing_page import ProjectListingPage
from framework.factory.models_enums.constants_enums import LoginUser
from tests.test_fixtures import clean_up_project


@pytest.mark.createProjectTest
class TestCreateProject:
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
    def test_create_project(self, clean_up_project):
        """Test method to create a project."""
        # Load Project Listing Page
        project_list = ProjectListingPage(self.driver)
        assert project_list is not None, "Could not load Project Listing Page"

        # Check if guide is set ON and remove if ON.
        # This case shall be taken up as a separate method
        # and inject in all upcoming test cases
        is_guide_active = project_list.is_active_helper_guide_slider()
        if is_guide_active:
            is_clicked = project_list.click_got_it_button()
            assert is_clicked, "Could not click got it button"

            is_clicked = project_list.click_helper_guide_slider()
            assert is_clicked, "Could not click helper guide slider"

            is_clicked = project_list.click_helper_close_button()
            assert is_clicked, "Could not click helper close button"

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

        # Click on Projects menu, reload listing page, check for project title
        is_clicked = project_list.click_projects_menu()
        assert is_clicked, "Could not click projects menu."
        project_list = ProjectListingPage(self.driver)
        is_project_first_item = project_list.compare_project_title(1, project_title)
        assert is_project_first_item, "The new project is not added as first item."


