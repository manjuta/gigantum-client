from framework.base.component_base import BaseComponent
from framework.factory.models_enums.constants_enums import LocatorType
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel


class SignUpComponent(BaseComponent):
    """ Represents one of the components of login page.

    Holds a set of all locators within the user sign up frame on the login page of
    gigantum client as an entity. Handles events and test functions of locators
    in this entity.
    """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(SignUpComponent, self).__init__(driver, component_data)
        self.title_sign_in = self.get_locator(LocatorType.XPath, f"//div[@class='auth0-lock-name']")

    def get_sign_up_title(self) -> str:
        """ Returns the title of sign-up button."""
        return self.title_sign_in.get_text()

    def move_to_log_in_tab(self) -> None:
        """Performs the navigation to log-in tab."""
        _btn_logIn = self.get_locator(LocatorType.XPath, "//a[contains(text(),'Log In')]")
        return _btn_logIn.click()
