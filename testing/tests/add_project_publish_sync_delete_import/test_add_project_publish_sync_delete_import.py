"""Test call for Add Project, Publish, Sync, Delete and Import"""
import pytest
from tests.helper.project_utility import ProjectUtility
from configuration.configuration import ConfigurationManager
from client_app.pages.landing.landing_page import LandingPage
from client_app.pages.project_listing.project_listing_page import ProjectListingPage
from framework.factory.models_enums.constants_enums import LoginUser
from tests.constants_enums.constants_enums import ProjectConstants
from tests.test_fixtures import clean_up_project
from client_app.helper.local_project_helper_utility import ProjectHelperUtility
import time


@pytest.mark.addProjectPublishSyncDeleteImport
class TestAddProjectPublishSyncDeleteImport:
    """Includes test methods for basic project, publish, sync, delete and import"""

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
    def test_add_project_publish_sync_delete_import(self, clean_up_project):
        """Test method to create a project, publish, sync, delete and import"""
        # Create project
        is_success_msg = ProjectUtility().create_project(self.driver)
        assert is_success_msg == ProjectConstants.SUCCESS.value, is_success_msg

        # Load Project Listing Page
        project_list = ProjectListingPage(self.driver)
        assert project_list is not None, "Could not load Project Listing Page"

        # Get project title
        project_title = project_list.project_menu_component.get_project_name()
        assert project_title is not None, "Could not get the project title"

        # Add files into code data, input data and output data
        self.add_files(project_list, project_title)

        # Publish project
        self.publish_project(project_list)

        # Update files and sync
        self.update_files_and_sync(project_list)

        # Delete local project
        is_success_msg = ProjectUtility().delete_project(self.driver)
        assert is_success_msg == ProjectConstants.SUCCESS.value, is_success_msg

        # Verify project is not listed in project listing page
        is_verified = project_list.project_listing_component.verify_project_in_project_listing(project_title)
        assert is_verified, "Project is exist in the project listing page"

        # Verify project no longer exists on disk
        is_verified = ProjectHelperUtility().check_project_removed_from_disk(project_title)
        assert is_verified, "Project is exist in the disk"

        # Verify project image is no longer exist
        is_verified = ProjectHelperUtility().check_project_image_is_removed(project_title)
        assert is_verified, "Project image is not removed"

        # Import project and verify project contents
        self.import_project_and_verify_project_content(project_list, project_title)

        # Delete local project
        is_success_msg = ProjectUtility().delete_project(self.driver)
        assert is_success_msg == ProjectConstants.SUCCESS.value, is_success_msg

        # Delete project from server
        self.delete_project_from_server(project_list, project_title)

    def add_files(self, project_list, project_title):
        """Logical separation of add files in to code data, input data and output data

        Args:
            project_list: The page with UI elements
            project_title: Title of the project

        """
        # Click on Code Tab
        is_clicked = project_list.project_menu_component.click_code_data_tab()
        assert is_clicked, "Could not click Code tab"

        # Drag and drop text file into code data drop zone
        is_dropped = project_list.code_input_output_component.drag_and_drop_text_file_in_code_drop_zone('created')
        assert is_dropped, "Could not drag and drop text file in to code data drop zone"

        # Drag and drop text file into code data untracked folder
        is_dropped = ProjectHelperUtility().move_file_to_untracked_folder('code', project_title)
        assert is_dropped, "Could not drag and drop text file into code data untracked folder"

        # Drag and drop text file into code data file browser
        is_dropped = project_list.code_input_output_component.drag_and_drop_text_file_in_code_file_browser('created')
        assert is_dropped, "Could not drag and drop text file in to code data file browser"

        # Click on Input Data tab
        is_clicked = project_list.project_menu_component.click_input_data_tab()
        assert is_clicked, "Could not click Input Data tab"

        # Drag and drop text file into input drop zone
        is_dropped = project_list.code_input_output_component.drag_and_drop_text_file_in_input_drop_zone('created')
        assert is_dropped, "Could not drag and drop text file in input drop zone"

        # Drag and drop text file into input untracked folder
        is_dropped = ProjectHelperUtility().move_file_to_untracked_folder('input', project_title)
        assert is_dropped, "Could not drag and drop text file into input untracked folder"

        # Drag and drop text file into input file browser area
        is_dropped = project_list.code_input_output_component.drag_and_drop_text_file_in_input_file_browser('created')
        assert is_dropped, "Could not drag and drop text file in to input file browser area"

        # Click on Output Data tab
        is_clicked = project_list.project_menu_component.click_output_data_tab()
        assert is_clicked, "Could not click Output Data tab"

        # Drag and drop text file into output drop zone
        is_dropped = project_list.code_input_output_component.drag_and_drop_text_file_in_output_drop_zone('created')
        assert is_dropped, "Could not drag and drop text file in output drop zone"

        # Drag and drop text file into output untracked folder
        is_dropped = ProjectHelperUtility().move_file_to_untracked_folder('output', project_title)
        assert is_dropped, "Could not drag and drop text file into output untracked folder"

        # Drag and drop text file into output file browser
        is_dropped = project_list.code_input_output_component.drag_and_drop_text_file_in_output_file_browser('created')
        assert is_dropped, "Could not drag and drop text file in to output file browser"

    def publish_project(self, project_list):
        """Logical separation of publish project functionality

        Args:
            project_list: The page with UI elements

        """
        # Click on project publish button
        is_clicked = project_list.project_menu_component.click_publish_button()
        assert is_clicked, "Could not click project publish button"

        # Enable private mode in project publish window
        is_enabled = project_list.project_menu_component.enable_private_mode()
        assert is_enabled, "Could not enable private mode in project publish window"

        # Click on publish button on publish window
        is_clicked = project_list.project_menu_component.click_publish_window_button()
        assert is_clicked, "Could not click project publish button on project publish window"

        # Monitor container status to go through Stopped -> Publishing
        is_status_changed = project_list.monitor_container_status("Publishing", 60)
        assert is_status_changed, "Could not get Publishing status"

        # Monitor container status to go through Publishing -> Stopped
        is_status_changed = project_list.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

        # Check private lock icon presence
        is_checked = project_list.project_menu_component.check_private_lock_icon_presence()
        assert is_checked, "Could not found private lock icon presence"

    def update_files_and_sync(self, project_list):
        """Logical separation of updates files and sync

        Args:
            project_list: The page with UI elements

        """
        # Click on Code Tab
        is_clicked = project_list.project_menu_component.click_code_data_tab()
        assert is_clicked, "Could not click Code tab"

        # Drag and drop text file into code data file browser area
        is_dropped = project_list.code_input_output_component.drag_and_drop_text_file_in_code_file_browser('updated')
        assert is_dropped, "Could not drag and drop text file in to code file browser area"

        # Click on Input Data tab
        is_clicked = project_list.project_menu_component.click_input_data_tab()
        assert is_clicked, "Could not click Code tab"

        # Drag and drop text file into input data file browser area
        is_dropped = project_list.code_input_output_component.drag_and_drop_text_file_in_input_file_browser('updated')
        assert is_dropped, "Could not drag and drop text file in to input data file browser area"

        # Click on Sync button
        is_clicked = project_list.project_menu_component.click_sync_button()
        assert is_clicked, "Could not click Sync button"

        # Monitor container status to go through Stopped -> Syncing
        is_status_changed = project_list.monitor_container_status("Syncing", 60)
        assert is_status_changed, "Could not get Syncing status"

        # Monitor container status to go through Syncing -> Stopped
        is_status_changed = project_list.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

        # Monitor container status to go through Stopped -> Building
        project_list.monitor_container_status("Building", 10)

        # Monitor container status to go through Syncing -> Stopped
        is_status_changed = project_list.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

    def import_project_and_verify_project_content(self, project_list, project_title):
        """ Logical separation of import project and verify project content

        Args:
            project_list: The page with UI elements
            project_title: Title of the current project

        """
        # Click Gigantum Hub tab
        is_clicked = project_list.gigantum_hub_component.click_gigantum_hub_tab()
        assert is_clicked, "Could not click Gigantum Hub tab"

        # Verify project in Gigantum Hub page
        is_verified = project_list.gigantum_hub_component.verify_project_in_gigantum_hub(project_title)
        assert is_verified, "Could not verify project in Gigantum Hub"

        # Click import button in Gigantum Hub page
        is_clicked = project_list.gigantum_hub_component.click_import_button(project_title)
        assert is_clicked, "Could not click import button in Gigantum Hub page"

        # Monitor container status to go through Stopped -> Building
        is_status_changed = project_list.monitor_container_status("Building", 60)
        assert is_status_changed, "Could not get Building status"

        # Monitor container status to go through Building -> Stopped
        is_status_changed = project_list.monitor_container_status("Stopped", 60)
        assert is_status_changed, "Could not get Stopped status"

        # Verify the untracked directories in code, input, and output are all empty
        is_verified = ProjectHelperUtility().verify_untracked_directory_is_empty(project_title)
        assert is_verified, "Untracked directories in code, input and output are not empty"

        # Verify file content in Code directory
        is_verified = ProjectHelperUtility().verify_file_content('code', 'updated', project_title)
        assert is_verified, "Could not verify the file contents in Code directory"

        # Verify file content in Input data directory
        is_verified = ProjectHelperUtility().verify_file_content('input', 'updated', project_title)
        assert is_verified, "Could not verify the file contents in Input data directory"

        # Verify file content in Output data directory
        is_verified = ProjectHelperUtility().verify_file_content('output', 'created', project_title)
        assert is_verified, "Could not verify the file contents in Output data directory"

    def delete_project_from_server(self, project_list, project_title):
        """ Logical separation of delete project from server

        Args:
            project_list: The page with UI elements
            project_title: Title of the current project

        """
        # Click Gigantum Hub tab
        is_clicked = project_list.gigantum_hub_component.click_gigantum_hub_tab()
        assert is_clicked, "Could not click Gigantum Hub tab"

        # Verify project in Gigantum Hub page
        is_verified = project_list.gigantum_hub_component.verify_project_in_gigantum_hub(project_title)
        assert is_verified, "Could not verify project in Gigantum Hub"

        # Click delete button in Gigantum Hub page
        is_clicked = project_list.gigantum_hub_component.click_delete_button(project_title)
        assert is_clicked, "Could not click delete button in Gigantum Hub page"

        # Get project title from delete project window in Gigantum Hub page
        project_name = project_list.gigantum_hub_component.get_project_title()
        assert project_name is not None, "Could not get project title in Gigantum Hub page"

        # Input project title in delete window on Gigantum Hub page
        is_typed = project_list.gigantum_hub_component.input_project_title(project_name)
        assert is_typed, "Could not type project title in delete window on Gigantum Hub page"

        # Click delete project button in delete window on Gigantum Hub page
        is_clicked = project_list.gigantum_hub_component.click_delete_button_on_window()
        assert is_clicked, "Could not click delete project button in delete window on Gigantum Hub page"

        # Verify delete modal close
        is_verified = project_list.gigantum_hub_component.verify_delete_modal_closed(30)
        assert is_verified, "Could not close delete modal"

        # Verify project is not exist in Gigantum Hub page
        is_verified = project_list.gigantum_hub_component.verify_project_in_gigantum_hub(project_title)
        assert not is_verified, "Project is still exist in the Gigantum Hub"

        # wait ~5 seconds to guarantee server side deletion completes
        time.sleep(5)

        # Refresh the "Gigantum Hub" tab
        is_clicked = project_list.gigantum_hub_component.click_gigantum_hub_tab()
        assert is_clicked, "Could not click Gigantum Hub tab"

        # Verify project is not exist in Gigantum Hub page
        is_verified = project_list.gigantum_hub_component.verify_project_in_gigantum_hub(project_title)
        assert not is_verified, "Project is still exist in the Gigantum Hub"
