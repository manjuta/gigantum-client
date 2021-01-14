from framework.base.component_base import BaseComponent
from framework.factory.models_enums.constants_enums import LocatorType
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel


class CollaboratorsModalComponent(BaseComponent):
    """ Represents one of the components of project listing page.

       Holds a set of all locators within the collaborators modal on the project listing page of
       gigantum client as an entity. Handles events and test functions of locators
       in this entity.
       """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(CollaboratorsModalComponent, self).__init__(driver, component_data)

    def add_collaborator(self, collaborator_name) -> bool:
        """ Add collaborator into input area

        Args:
            collaborator_name: Name of the collaborator

        Returns: returns the result of input action

        """
        element = "//input[@placeholder='Add Collaborator']"
        collaborator_input_area = self.get_locator(LocatorType.XPath, element)
        if collaborator_input_area is not None:
            collaborator_input_area.send_keys(collaborator_name)
            return True
        return False

    def select_admin_permission(self) -> bool:
        """ Select admin permission from drop down

        Returns: returns the result of selection

        """
        element = "//span[contains(text(), 'Read')]"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            drop_down_element = self.get_locator(LocatorType.XPath, element)
            drop_down_element.click()
            element = "//li/div[contains(text(), 'Admin')]"
            if self.check_element_presence(LocatorType.XPath, element, 30):
                admin_menu = self.get_locator(LocatorType.XPath, element)
                admin_menu.click()
                return True
        return False

    def click_add_collaborator_button(self) -> bool:
        """ Performs click event on add collaborator button

        Returns: returns the result of click action

        """
        element = "//button[@data-selenium-id='ButtonLoader']"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            btn_add_collaborator = self.get_locator(LocatorType.XPath, element)
            btn_add_collaborator.click()
            return True
        return False

    def verify_collaborator_is_listed(self, collaborator_name) -> bool:
        """ Verify collaborator is listed in the modal

        Args:
            collaborator_name: Name of the collaborator

        Returns: returns the result of verification

        """
        element = f"//li/div[contains(text(), '{collaborator_name}')]"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            return True
        return False

    def click_collaborator_modal_close(self) -> bool:
        """ Performs click action on collaborator modal close

        Returns: returns the result of click action

        """
        element = "//button[@class='Btn Btn--flat Modal__close padding--small ']"
        btn_close_collaborator = self.get_locator(LocatorType.XPath, element)
        if btn_close_collaborator is not None:
            btn_close_collaborator.click()
            return True
        return False

