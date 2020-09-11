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
        self.txt_project_title = self.get_locator(LocatorType.XPath, "//h1[contains(text(),'Projects')]")
        self.btn_profile_menu = self.get_locator(LocatorType.XPath, "//h6[@id='username']")

    def get_project_title(self) -> str:
        """Returns the title of project listing page."""
        return self.txt_project_title.get_text()

    def profile_menu_click(self) -> None:
        """Performs click event of profile menu item."""
        self.btn_profile_menu.click()

    def log_out(self) -> None:
        """Performs click event of logout menu item."""
        btn_logout = self.get_locator(LocatorType.XPath, "//button[@id='logout']")
        btn_logout.click()
