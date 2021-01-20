from framework.base.component_base import BaseComponent
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel
from framework.factory.models_enums.constants_enums import CompareUtilityType
from framework.factory.models_enums.constants_enums import LocatorType
from selenium.webdriver.common.action_chains import ActionChains


class ProjectContainerStatusComponent(BaseComponent):
    """ Represents one of the components while creation of a project.

    Holds a set of all locators within the container status layout on the project creation page of
    Gigantum client as an entity. Handles events and test functions of locators
    in this entity.
    """

    def __init__(self, driver: webdriver) -> None:
        project_container_status_model = ComponentModel()
        super(ProjectContainerStatusComponent, self).__init__(driver, project_container_status_model)

    def monitor_container_status(self, compare_text: str, wait_timeout: int) -> bool:
        """Monitors the text in the div of the component with the value in arg

        Args:
            compare_text: The text to compare with.
            wait_timeout: Time period for which the wait should continue

        Returns:
            Returns the comparison result.
        """
        element = "//div[@class='ContainerStatus flex flex--row']/div"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            container_status_element = self.get_locator(LocatorType.XPath, element)
            container_status_text = container_status_element.find_element_by_xpath("div")
            compared_value = container_status_text.wait_until(CompareUtilityType.CompareText, wait_timeout, compare_text)
            return compared_value
        return False

    def click_container_status(self) -> bool:
        """ Checks if the div is clickable and performs the click action using ActionChains"""
        container_status_element = self.get_locator(LocatorType.XPath, "//div[@data-selenium-id='ContainerStatus']")
        if container_status_element is not None and container_status_element.element_to_be_clickable():
            ActionChains(self.driver).move_to_element(container_status_element).click().perform()
            return True
        return False
