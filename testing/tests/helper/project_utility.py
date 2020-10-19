import random
from client_app.pages.project_listing.project_listing_page import ProjectListingPage
from selenium import webdriver
from tests.constants_enums.constants_enums import ProjectConstants
from client_app.pages.jupyter_lab.jupyter_lab_page import JupyterLabPage


class ProjectUtility:
    def create_project(self, driver: webdriver) -> str:
        """Logical separation of create package functionality"""
        # Create a project
        # Load Project Listing Page
        project_list = ProjectListingPage(driver)
        if not project_list:
            return "Could not load Project Listing Page"

        # Closes the guide
        is_guide_close_msg = self.__close_guide(project_list)
        if is_guide_close_msg != ProjectConstants.SUCCESS.value:
            return is_guide_close_msg

        # Click on "Create New"
        is_clicked = project_list.click_create_button()
        if not is_clicked:
            return "Could not click Create New"

        # Enter project title-(unique random name) and description
        # UUID is not given now, since it creates big string
        # This can be changed along with upcoming  text cases
        project_title = f"p-{str(random.random())}"
        project_title = project_title.replace(".", "")
        is_project_title_typed = project_list.type_project_title(project_title)
        is_project_desc_typed = project_list.type_new_project_desc_textarea(f"{project_title} -> Description ")
        if not is_project_title_typed:
            return "Could not type project title"
        if not is_project_desc_typed:
            return "Could not type project description"

        # Click "Continue"
        is_submitted = project_list.click_submit_button()
        if not is_submitted:
            return "Could not click Continue button to create new project"

        # Select the "Python3 Minimal" Base
        is_base_option_clicked = project_list.click_python3_minimal_stage()
        if not is_base_option_clicked:
            return "Could not click option-python3_minimal_stage"

        # Click "Create Project"
        is_submitted = project_list.click_submit_button()
        if not is_submitted:
            return "Could not click Create Project button after Base select"

        # Monitor container status to go to building state
        is_status_changed = project_list.monitor_container_status("Building", 60)
        if not is_status_changed:
            return "Could not get Building status"

        # Monitor container status to go through building -> stopped state
        is_status_changed = project_list.monitor_container_status("Stopped", 60)
        if not is_status_changed:
            return "Could not get Stopped status"

        return ProjectConstants.SUCCESS.value

    def __close_guide(self, project_list) -> str:
        """ Logical separation of closing the guide after log in

        Args:
            project_list: The page with UI elements
        """
        is_guide_active = project_list.is_active_helper_guide_slider()
        if is_guide_active:
            is_clicked = project_list.click_got_it_button()
            if not is_clicked:
                return "Could not click got it button"

            is_clicked = project_list.click_helper_guide_slider()
            if not is_clicked:
                return "Could not click helper guide slider"

            is_clicked = project_list.click_helper_close_button()
            if not is_clicked:
                return "Could not click helper close button"
        return ProjectConstants.SUCCESS.value

    def verify_package_version(self, driver: webdriver, packages: list = None, is_only_exist: bool = False) -> str:
        """ Logical separation of verify package using jupyter

        Args:
            driver: webdriver instance
            packages: The page with UI elements
            is_only_exist: Decision variable to determine whether to check for all packages or given packages only
        """
        # Load Project Package Page
        jupyter_lab_page = JupyterLabPage(driver)
        if not jupyter_lab_page:
            return "Could not load Project Listing Page"

        # Check package installation using jupyter
        is_clicked = jupyter_lab_page.click_jupyterlab_div()
        if not is_clicked:
            return "Could not click Jupyter Lab button"

        # Wait for new tab to open with new url
        is_url_loaded = jupyter_lab_page.wait_for_url_in_new_tab("/lab", 1, 60)
        if not is_url_loaded:
            return "Could not open new window"

        # Click Python3 under notebook
        is_clicked = jupyter_lab_page.click_python3_notebook()
        if not is_clicked:
            return "Could not click python3 under notebook"

        # Type command
        command_typed = jupyter_lab_page.type_command("pip freeze | grep gtmunit")
        if not command_typed:
            return "Could not type the commands"

        # Click run cell to run the command
        is_clicked = jupyter_lab_page.click_run_cell()
        if not is_clicked:
            return "Could not click run for command"

        # Checks packages_and_version and close tab
        if not is_only_exist:
            is_package_exist = jupyter_lab_page.is_packages_exist(packages)
        else:
            is_package_exist = jupyter_lab_page.is_packages_only_exist(packages)
        if not is_package_exist:
            return "Verification of installed package fails"
        jupyter_lab_page.close_tab("/lab", 0)

        # Click on container status button to stop container
        is_clicked = jupyter_lab_page.click_container_status()
        if not is_clicked:
            return "Could not click container status"

        # Monitor container status to go through running -> stopped
        jupyter_lab_page.move_to_element()
        is_status_changed = jupyter_lab_page.monitor_container_status("Stopped", 60)
        if not is_status_changed:
            return "Could not get Stopped status"

        return ProjectConstants.SUCCESS.value

