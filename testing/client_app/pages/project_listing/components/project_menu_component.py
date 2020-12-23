from framework.base.component_base import BaseComponent
from framework.factory.models_enums.constants_enums import LocatorType
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel


class ProjectMenuComponent(BaseComponent):
    """ Represents one of the components of project listing page.

       Holds a set of all menu and button locators on the project listing page of
       gigantum client as an entity. Handles events and test functions of locators
       in this entity.
       """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(ProjectMenuComponent, self).__init__(driver, component_data)

    def get_project_name(self) -> str:
        """ Get the current project name

        Returns: returns project name

        """
        element = "//div[@class='TitleSection__namespace-title']"
        project_title = self.get_locator(LocatorType.XPath, element)
        if project_title is not None:
            project_title = project_title.get_text().split('/')[-1].strip()
            return project_title

    def click_code_data_tab(self) -> bool:
        """ Performs click event on code data tab.

        Returns: returns the result of click action

        """
        element = f"//li[@id='code']"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            code_data_tab = self.get_locator(LocatorType.XPath, element)
            code_data_tab.click()
            return True
        return False

    def click_input_data_tab(self) -> bool:
        """ Performs click event on input data tab.

        Returns: returns the result of click action

        """
        element = f"//li[@id='inputData']"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            input_data_tab = self.get_locator(LocatorType.XPath, element)
            input_data_tab.click()
            return True
        return False

    def click_output_data_tab(self) -> bool:
        """ Performs click event on output data tab.

        Returns: returns the result of click action

        """
        element = f"//li[@id='outputData']"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            output_data_tab = self.get_locator(LocatorType.XPath, element)
            output_data_tab.click()
            return True
        return False

    def click_publish_button(self) -> bool:
        """ Performs click action on publish button

        Returns: returns the result of click action

        """
        element = "//div[contains(text(), 'Publish')]"
        btn_publish = self.get_locator(LocatorType.XPath, element)
        if btn_publish is not None:
            btn_publish.click()
            return True
        return False

    def enable_private_mode(self) -> bool:
        """ Enable private mode in publish project by clicking radio button

        Returns: returns the result of radio button click

        """
        element = "//div[@class='VisibilityModal__private']/label"
        btn_publish_private = self.get_locator(LocatorType.XPath, element)
        if btn_publish_private is not None:
            btn_publish_private.click()
            return True
        return False

    def click_publish_window_button(self) -> bool:
        """ Performs click action on publish button on project publish window

        Returns: returns the result of click action

        """
        element = "//button[contains(text(), 'Publish')]"
        if self.check_element_presence(LocatorType.XPath, element, 20):
            publish_button = self.get_locator(LocatorType.XPath, element)
            if publish_button is not None:
                publish_button.click()
                return True
        return False

    def check_private_lock_icon_presence(self) -> bool:
        """ Performs checking for lock icon presence

        Returns: returns the result of checking

        """
        element = "//div[@class='TitleSection__private Tooltip-data Tooltip-data--small']"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            return True
        return False

    def click_sync_button(self) -> bool:
        """ Performs click action on sync button

        Returns: returns the result of click action

        """
        element = "//div[contains(text(), 'Sync')]"
        if self.check_element_presence(LocatorType.XPath, element, 20):
            sync_button = self.get_locator(LocatorType.XPath, element)
            if sync_button is not None:
                sync_button.click()
                return True
        return False

    def click_project_menu_button(self) -> bool:
        """Performs click action on project menu button

        Returns: returns the result of click action

        """
        btn_project_menu = self.get_locator(LocatorType.XPath, "//button[@class='ActionsMenu__btn Btn--last']")
        if btn_project_menu is not None:
            btn_project_menu.click()
            return True
        return False

    def click_delete_project_menu(self) -> bool:
        """Performs click action on delete project menu

        Returns: returns the result of click action

        """
        element = f"//button[contains(text(), 'Delete Project')]"
        menu_project_delete = self.get_locator(LocatorType.XPath, element)
        if menu_project_delete is not None:
            menu_project_delete.click()
            return True
        return False
