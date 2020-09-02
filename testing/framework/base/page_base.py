from selenium import webdriver
from framework.factory.models_enums.page_config import PageConfig
from framework.factory.page_factory import PageFactory
from configuration.configuration import ConfigurationManager
import inspect


class BasePage(PageFactory):
    """Base class to create a page."""

    def __init__(self, driver: webdriver, page_data: PageConfig, can_use_config_url: bool = True) -> None:
        """Initializes the BasePage.

        Args:
            driver: web driver
            page_data: giver page data (url, timeout, highlight)
            can_use_config_url: condition parameter to load page url from config file
        """
        stack = inspect.stack()
        class_name = stack[1][0].f_locals["self"].__class__.__name__

        self.driver = driver  # Required
        self.timeout = page_data.timeout
        self.highlight = page_data.highlight
        if can_use_config_url:
            url = ConfigurationManager.getInstance().get_page_url(class_name)
            if url:
                self.driver.get(url)
