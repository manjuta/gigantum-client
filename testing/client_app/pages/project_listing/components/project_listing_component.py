from framework.base.component_base import BaseComponent
from framework.factory.models_enums.constants_enums import LocatorType
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel


class ProjectListingComponent(BaseComponent):
    """ Represents one of the components of project listing page.

       Holds a set of all locators within the title layout on the project listing page of
       gigantum client as an entity. Handles events and test functions of locators
       in this entity.
       """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(ProjectListingComponent, self).__init__(driver, component_data)

    def get_project_title(self) -> str:
        """Returns the title of project listing page."""
        txt_project_title = self.get_locator(LocatorType.XPath, "//h1[contains(text(),'Projects')]")
        return txt_project_title.get_text()

    def profile_menu_click(self) -> None:
        """Performs click event of profile menu item."""
        btn_profile_menu = self.get_locator(LocatorType.XPath, "//h6[@id='username']")
        btn_profile_menu.click()

    def log_out(self) -> None:
        """Performs click event of logout menu item."""
        btn_logout = self.get_locator(LocatorType.XPath, "//button[@id='logout']")
        btn_logout.click()

    def verify_project_in_project_listing(self, project_title) -> bool:
        """ Verify whether the project is present in the project listing page or not

        Args:
            project_title: Title of the current project

        Returns: returns the result of project verification

        """
        element = "//a[@class='Card Card--225 Card--text column-4-span-3 flex flex--column justify--space-between']"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            projects_list = self.driver.find_elements_by_xpath(element)
            if projects_list is not None:
                for project in projects_list:
                    project_name = project.find_element_by_xpath(".//div[@class='LocalLabbooks__row--text']/div/h5/div")
                    if project_title == project_name.get_text().strip():
                        return False
        return True

