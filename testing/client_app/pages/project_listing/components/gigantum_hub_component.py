from framework.base.component_base import BaseComponent
from framework.factory.models_enums.constants_enums import LocatorType
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel


class GigantumHubComponent(BaseComponent):
    """ Represents one of the components of project listing page.

       Holds a set of all locators within the Gigantum Hub window on the project listing page of
       gigantum client as an entity. Handles events and test functions of locators
       in this entity.
       """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(GigantumHubComponent, self).__init__(driver, component_data)

    def click_gigantum_hub_tab(self) -> bool:
        """ Performs click action on gigantum hub tab

        Returns: returns the result of click action

        """
        gigantum_hub_tab = self.get_locator(LocatorType.XPath, "//button[contains(text(),'Gigantum Hub')]")
        if gigantum_hub_tab is not None:
            gigantum_hub_tab.click()
            return True
        return False

    def verify_project_in_gigantum_hub(self, project_title) -> bool:
        """ Verify whether the project is present in the Gigantum Hub page or not

        Args:
            project_title: Title of the current project

        Returns: returns the result of project verification

        """
        element = "//div[@data-selenium-id='RemoteLabbookPanel']"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            projects_list = self.driver.find_elements_by_xpath(element)
            if projects_list is not None:
                for project in projects_list:
                    project_name = project.find_element_by_xpath\
                        (".//div[@class='RemoteLabbooks__row RemoteLabbooks__row--text']/div[1]")
                    if project_title == project_name.get_text().strip():
                        return True
        return False

    def click_import_button(self, project_title) -> bool:
        """ Performs click action on import button

        Args:
            project_title: Title of the current project

        Returns: returns the result of click action

        """
        element = "//div[@data-selenium-id='RemoteLabbookPanel']"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            projects_list = self.driver.find_elements_by_xpath(element)
            if projects_list is not None:
                for project in projects_list:
                    project_name = project.find_element_by_xpath \
                        (".//div[@class='RemoteLabbooks__row RemoteLabbooks__row--text']/div[1]")
                    if project_title == project_name.get_text().strip():
                        import_button = project.find_element_by_xpath(".//button[contains(text(),'Import')]")
                        if import_button is not None:
                            import_button.execute_script("arguments[0].click();")
                            return True
        return False

    def click_delete_button(self, project_title) -> bool:
        """ Performs click action on delete button

        Args:
            project_title: Title of the current project

        Returns: returns the result of click action

        """
        element = "//div[@data-selenium-id='RemoteLabbookPanel']"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            projects_list = self.driver.find_elements_by_xpath(element)
            if projects_list is not None:
                for project in projects_list:
                    project_name = project.find_element_by_xpath\
                        (".//div[@class='RemoteLabbooks__row RemoteLabbooks__row--text']/div[1]")
                    if project_title == project_name.get_text().strip():
                        delete_button = project.find_element_by_xpath(".//button[contains(text(),'Delete')]")
                        if delete_button is not None:
                            delete_button.execute_script("arguments[0].click();")
                            return True
        return False

    def get_project_title(self) -> str:
        """ Fetch project title from the delete project window

        Returns: returns project title

        """
        element = "//div[@class='Modal__sub-container']/div[1]"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            div_text = self.get_locator(LocatorType.XPath, element)
            project_title = div_text.find_element_by_xpath(".//b")
            return project_title.get_text().strip()

    def input_project_title(self, project_title) -> bool:
        """Input project title for deletion

        Args:
            project_title: Title of the current project

        Returns:

        """
        delete_input = self.get_locator(LocatorType.XPath, "//input[@id='deleteInput']")
        if delete_input is not None:
            delete_input.send_keys(project_title)
            return True
        return False

    def click_delete_button_on_window(self) -> bool:
        """Performs click action on delete button

        Returns: returns the result of click action

        """
        element = "//button[@data-selenium-id='ButtonLoader']"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            btn_delete_project = self.get_locator(LocatorType.XPath, element)
            if btn_delete_project is not None and btn_delete_project.element_to_be_clickable():
                btn_delete_project.execute_script("arguments[0].click();")
                return True
        return False

    def verify_delete_modal_closed(self, wait_time: int) -> bool:
        """ Verify delete modal close after project deletion

        Args:
            wait_time: Time period for which the wait should continue

        Returns: returns the result of modal verification

        """
        element = "//div[@class='Icon Icon--delete']"
        return self.check_element_absence(LocatorType.XPath, element, wait_time)
