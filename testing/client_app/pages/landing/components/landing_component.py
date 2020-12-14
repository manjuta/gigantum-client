
from client_app.pages.login.log_in_page import LogInPage
from framework.base.component_base import BaseComponent
from framework.factory.models_enums.constants_enums import LocatorType
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel


class LandingComponent(BaseComponent):
    """Represents one of the components of landing page.

    Holds a set of all locators within the user login frame on the landing page of
    gigantum client as an entity. Handles events and test functions of locators
    in this entity.
    """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(LandingComponent, self).__init__(driver, component_data)
        self.btn_server = self.get_locator(LocatorType.XPath, "//button[@class='Btn Server__button']")

    def load_log_in_page(self) -> LogInPage:
        """Performs navigation to login page.

        Click event on the sign-in button is performed,
        and login page is displayed.

        Returns:
            An instance of LoginPage.
        """
        self.btn_server.click()
        log_in_page = LogInPage(self.driver)
        return log_in_page

    def get_server_button_text(self) -> str:
        """Returns the title of server button"""
        return self.btn_server.get_text()
