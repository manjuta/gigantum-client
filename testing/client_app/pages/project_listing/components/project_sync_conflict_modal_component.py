from framework.base.component_base import BaseComponent
from framework.factory.models_enums.constants_enums import LocatorType
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel


class ProjectSyncConflictModalComponent(BaseComponent):
    """ Represents one of the components of project listing page.

       Holds a set of all locators within the project sync conflict modal on the project listing page of
       gigantum client as an entity. Handles events and test functions of locators
       in this entity.
       """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(ProjectSyncConflictModalComponent, self).__init__(driver, component_data)

    def check_sync_conflict_modal_presence(self) -> bool:
        """ Check presence of sync conflict modal

        Returns: returns the result of element checking

        """
        element = "//h1[contains(text(), 'Sync Conflict')]"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            return True
        return False

    def click_abort_button(self) -> bool:
        """ Performs click event on Abort button

        Returns: returns the result of click action

        """
        element = "//button[contains(text(), 'Abort')]"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            btn_abort = self.get_locator(LocatorType.XPath, element)
            btn_abort.click()
            return True
        return False

    def check_sync_conflict_modal_absence(self) -> bool:
        """ Check presence of sync conflict modal

        Returns: returns the result of element checking

        """
        element = "//h1[contains(text(), 'Sync Conflict')]"
        if self.check_element_absence(LocatorType.XPath, element, 30):
            return True
        return False

    def click_use_theirs_button(self) -> bool:
        """ Performs click event on Abort button

        Returns: returns the result of click action

        """
        element = "//button[contains(text(), 'Use Theirs')]"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            btn_abort = self.get_locator(LocatorType.XPath, element)
            btn_abort.click()
            return True
        return False

    def click_mine_button(self) -> bool:
        """ Performs click event on Mine button

        Returns: returns the result of click action

        """
        element = "//button[contains(text(), 'Use Mine')]"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            btn_abort = self.get_locator(LocatorType.XPath, element)
            btn_abort.click()
            return True
        return False


