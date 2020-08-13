from framework.base.component_base import BaseComponent
from framework.factory.models_enums.constants_enums import LocatorType
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel


class LogInComponent(BaseComponent):
    """Represents one of the components of login page.

    Holds a set of all locators within the user login frame on the login page of
    gigantum client as an entity. Handles events and test functions of locators
    in this entity.
    """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(LogInComponent, self).__init__(driver, component_data)
        self.title_sign_in = self.get_locator(LocatorType.XPath, "//div[@class='auth0-lock-name']")

    def get_log_in_title(self) -> str:
        """Returns the title of log-in button."""
        return self.title_sign_in.get_text()

    def login(self, user_name: str, password: str) -> None:
        """Performs log-in functionality.

        Args:
            user_name:
                Name of the user who wants to login to the application.
            password:
                Password assigned for the current user.
        """
        txt_user_name = self.get_locator(LocatorType.XPath, "//input[@placeholder='username/email']")
        txt_password = self.get_locator(LocatorType.XPath, "//input[@placeholder='password']")
        btn_login = self.get_locator(LocatorType.XPath, "//button[@name='submit']//span//*[local-name()='svg']")
        txt_user_name.set_text(user_name)
        txt_password.set_text(password)
        btn_login.click()

    def click_not_existing_user(self) -> None:
        """Performs the click event of not-existing-user.

        The locator for the button is generated here and performs the click event to get log-in component.
        This scenario happens in UI after a successful logout.
        """
        btn_not_existing_user = self.get_locator(LocatorType.XPath, "//a[@class='auth0-lock-alternative-link']")
        btn_not_existing_user.click()
