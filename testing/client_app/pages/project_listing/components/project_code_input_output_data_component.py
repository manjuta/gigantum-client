from framework.base.component_base import BaseComponent
from framework.factory.models_enums.constants_enums import LocatorType
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel


class ProjectCodeInputOutputDataComponent(BaseComponent):
    """ Represents one of the components of project listing page.

       Holds a set of all locators within the code, input and output tab on the project listing page of
       gigantum client as an entity. Handles events and test functions of locators
       in this entity.
       """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(ProjectCodeInputOutputDataComponent, self).__init__(driver, component_data)

    def drag_and_drop_text_file_in_code_drop_zone(self, file_content: str) -> bool:
        """Drag and drop the text file into Code data drop zone

        Args:
            file_content: Content of the file to be drag

        Returns: returns the result of drag and drop action

        """
        drop_box = self.get_locator(LocatorType.XPath, "//div[@class='Dropbox "
                                                       "Dropbox--fileBrowser flex flex--column align-items--center']")
        if drop_box is not None:
            drop_box.drag_drop_file_in_drop_zone(file_content=file_content)
            return True
        return False

    def drag_and_drop_text_file_in_input_drop_zone(self, file_content: str) -> bool:
        """Drag and drop the text file into Input data drop zone

        Args:
            file_content: Content of the file to be drag

        Returns: returns the result of drag and drop action

        """
        drop_box = self.get_locator(LocatorType.XPath, "//div[@data-selenium-id='FileBrowser']/div[4]/div[3]")
        if drop_box is not None:
            drop_box.drag_drop_file_in_drop_zone(file_content=file_content)
            return True
        return False

    def drag_and_drop_text_file_in_output_drop_zone(self, file_content: str) -> bool:
        """Drag and drop the text file into Output data drop zone

        Args:
            file_content: Content of the file to be drag

        Returns: returns the result of drag and drop action

        """
        drop_box = self.get_locator(LocatorType.XPath, "//div[@class='Dropbox "
                                                       "Dropbox--fileBrowser flex flex--column align-items--center']")
        if drop_box is not None:
            drop_box.drag_drop_file_in_drop_zone(file_content=file_content)
            return True
        return False

    def drag_and_drop_text_file_in_code_file_browser(self, file_content: str) -> bool:
        """Drag and drop the text file in to code data file browser

        Args:
            file_content: Content of the file to be drag

        Returns: returns the result of drag and drop action

        """
        drop_box = self.get_locator(LocatorType.XPath, "//div[@class='FileBrowser']")
        if drop_box is not None:
            drop_box.drag_drop_file_in_drop_zone(file_content=file_content)
            return True
        return False

    def drag_and_drop_text_file_in_input_file_browser(self, file_content: str) -> bool:
        """Drag and drop the text file in to input data file browser

        Args:
            file_content: Content of the file to be drag

        Returns: returns the result of drag and drop action

        """
        drop_box = self.get_locator(LocatorType.XPath, "//div[@class='FileBrowser']")
        if drop_box is not None:
            drop_box.drag_drop_file_in_drop_zone(file_content=file_content)
            return True
        return False

    def drag_and_drop_text_file_in_output_file_browser(self, file_content: str) -> bool:
        """Drag and drop the text file in to output data file browser

        Args:
            file_content: Content of the file to be drag

        Returns: returns the result of drag and drop action

        """
        drop_box = self.get_locator(LocatorType.XPath, "//div[@class='FileBrowser']")
        if drop_box is not None:
            drop_box.drag_drop_file_in_drop_zone(file_content=file_content)
            return True
        return False

