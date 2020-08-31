from framework.base.component_base import BaseComponent
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel
from framework.factory.models_enums.constants_enums import CompareUtilityType


class ProjectContainerStatusComponent(BaseComponent):
    """ Represents one of the components while creation of a project.

    Holds a set of all locators within the container status layout on the project creation page of
    Gigantum client as an entity. Handles events and test functions of locators
    in this entity.
    """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(ProjectContainerStatusComponent, self).__init__(driver, component_data)

    def monitor_container_status(self, compare_text: str, wait_timeout: int) -> bool:
        """Monitors the text in the div of the component with the value in arg

        Args:
            compare_text: The text to compare with.

        Returns:
            Returns the comparison result.
        """
        container_status_element = self.ui_element.find_element_by_xpath("div")
        container_status_text = container_status_element.find_element_by_xpath("div")
        compared_value = container_status_text.wait_until(CompareUtilityType.CompareText, wait_timeout, compare_text)
        return compared_value

    def click_container_status(self) -> bool:
        """Performs the click action on the first level div element of the component"""
        container_status_element = self.ui_element.find_element_by_xpath("div")
        if container_status_element is not None:
            container_status_element.click()
            return True
        return False
