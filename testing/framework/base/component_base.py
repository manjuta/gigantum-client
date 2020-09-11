from selenium import webdriver
from framework.factory.page_factory import PageFactory
from framework.factory.models_enums.page_config import ComponentModel


class BaseComponent(PageFactory):
    """Base class to create a page component."""

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        """Initialize the Base Component class

        Args:
            driver:
                Current driver instance
            component_data:
                timeout * optional default 15 sec
                highlight * optional default True
                component_locator_type * optional
                component_locator * optional
        """
        self.driver = driver
        self.timeout = component_data.timeout
        self.highlight = component_data.highlight
        super(BaseComponent, self).__init__()
        if component_data.locator:
            self.ui_element = self.get_locator(component_data.locator_type,
                                               component_data.locator)
        else:
            self.ui_element = None
