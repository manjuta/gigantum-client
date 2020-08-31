from selenium.webdriver.remote.webelement import WebElement
from client_app.pages.project_listing.components.project_container_status_component import \
    ProjectContainerStatusComponent
from framework.base.page_base import BasePage
from framework.factory.models_enums.constants_enums import LocatorType
from framework.factory.models_enums.page_config import PageConfig
from framework.factory.models_enums.page_config import ComponentModel
from client_app.pages.project_listing.components.project_listing_component import ProjectListingComponent
from selenium.webdriver.common.action_chains import ActionChains


class ProjectListingPage(BasePage):
    """Represents the project-listing page of gigantum client.

    Holds the locators on the project-listing page of gigantum client. The locators can be
    presented in its corresponding component or directly on the page. Test functions can
    use these objects for all activities and validations and can avoid those in the
    test functions.
    """

    def __init__(self, driver) -> None:
        page_config = PageConfig()
        super(ProjectListingPage, self).__init__(driver, page_config)
        self._project_listing_model = ComponentModel()
        self.__project_grid_model = ComponentModel(locator_type=LocatorType.XPath, locator="//div[@class='grid']")
        self.__project_container_status_model = ComponentModel(locator_type=LocatorType.XPath,
                                                               locator="//div[@class='ContainerStatus flex flex--row']")
        self.__project_listing_component = None
        self.__comp_project_grid_component = None
        self.__container_status_component = None
        self.__btn_create_button = None
        self.__txt_new_project_title_input = None
        self.__txtarea_new_project_desc = None
        self.__but_new_project_submit = None
        self.__txt_python3_minimal_stage = None
        self.__href_projects_menu = None
        self.__div_container_status = None
        self.__div_project_title = None
        self.__href_grid = None
        self.__but_got_it = None
        self.__slider_helper_guide = None
        self.__but_helper_close = None

    @property
    def project_listing_component(self) -> ProjectListingComponent:
        """Returns instance of project listing component."""
        if self.__project_listing_component is None:
            self.__project_listing_component = ProjectListingComponent(self.driver, self._project_listing_model)
        return self.__project_listing_component

    @property
    def project_container_status_component(self) -> ProjectContainerStatusComponent:
        """Returns instance of the layout that holds container status"""
        if self.__container_status_component is None:
            self.__container_status_component = ProjectContainerStatusComponent(self.driver,
                                                                                self.__project_container_status_model)
        return self.__container_status_component

    @property
    def __create_button(self) -> WebElement:
        """UI element to add project"""
        if self.__btn_create_button is None:
            self.__btn_create_button = self.get_locator(LocatorType.XPath, "//div[@class='grid']/div/button[1]")
        return self.__btn_create_button

    @property
    def __new_project_title_input(self) -> WebElement:
        """UI element to input project title"""
        if self.__txt_new_project_title_input is None:
            self.__txt_new_project_title_input = self.get_locator(LocatorType.XPath, "//input[@id='CreateLabbookName']")
        return self.__txt_new_project_title_input

    @property
    def __new_project_desc(self) -> WebElement:
        """UI element to input project description"""
        if self.__txtarea_new_project_desc is None:
            self.__txtarea_new_project_desc = self.get_locator(LocatorType.XPath,
                                                               "//textarea[@id='CreateLabbookDescription']")
        return self.__txtarea_new_project_desc

    @property
    def __new_project_submit(self) -> WebElement:
        """UI element to submit project"""
        if self.__but_new_project_submit is None:
            self.__but_new_project_submit = self.get_locator(LocatorType.XPath,
                                                             "//button[@data-selenium-id='ButtonLoader']")
        return self.__but_new_project_submit

    @property
    def __python3_minimal_stage(self) -> WebElement:
        """UI element to select project base"""
        if self.__txt_python3_minimal_stage is None:
            self.__txt_python3_minimal_stage = self.get_locator(LocatorType.XPath,
                                                                "//h6[contains(text(),'Python3 Minimal')]")
        return self.__txt_python3_minimal_stage

    @property
    def __projects_menu(self) -> WebElement:
        """UI element for projects menu"""
        if self.__href_projects_menu is None:
            self.__href_projects_menu = self.get_locator(LocatorType.XPath,
                                                         "//a[@href='/projects/local']")
        return self.__href_projects_menu

    @property
    def __project_title(self) -> WebElement:
        """UI element for project title label"""
        if self.__div_project_title is None:
            self.__div_project_title = self.get_locator(LocatorType.XPath,
                                                        "//div[@class='TitleSection__namespace-title']")
        return self.__div_project_title

    @property
    def __project_name_from_list(self) -> WebElement:
        """UI element to represent the first project in the list"""
        if self.__href_grid is None:
            self.__href_grid = self.get_locator(LocatorType.XPath,
                                                "//div[@class='grid']/a[1]/div[2]//div[1]//h5[1]//div[1]")
        return self.__href_grid

    @property
    def __click_got_it_button(self) -> WebElement:
        """UI element to represent got it button"""
        if self.__but_got_it is None:
            self.__but_got_it = self.get_locator(LocatorType.XPath, "//button[@class='button--green']")
        return self.__but_got_it

    @property
    def __click_helper_guide_slider(self) -> WebElement:
        """UI element to represent helper guide slider"""
        if self.__slider_helper_guide is None:
            self.__slider_helper_guide = self.get_locator(LocatorType.XPath, "//span[@class='Helper-guide-slider']")
        return self.__slider_helper_guide

    @property
    def __click_helper_close_button(self) -> WebElement:
        """UI element to represent helper close button"""
        if self.__but_helper_close is None:
            self.__but_helper_close = self.get_locator(LocatorType.XPath,
                                                       "//div[contains(@class, 'Helper__button') and "
                                                       "contains(@class, 'Helper__button--open')]")
        return self.__but_helper_close

    def click_create_button(self) -> bool:
        """Click action on create project"""
        if self.__create_button.is_enabled():
            self.__create_button.click()
            return True
        return False

    def type_project_title(self, title: str) -> bool:
        """Input action for project title"""
        if self.__new_project_title_input.is_enabled():
            self.__new_project_title_input.send_keys(title)
            return True
        return False

    def type_new_project_desc_textarea(self, desc: str) -> bool:
        """Input action for project description"""
        if self.__new_project_desc.is_enabled():
            self.__new_project_desc.send_keys(desc)
            return True
        return False

    def click_submit_button(self) -> bool:
        """Click action for new project submit"""
        if self.__new_project_submit.is_enabled():
            self.__new_project_submit.click()
            return True
        return False

    def click_python3_minimal_stage(self) -> bool:
        """Click action for selecting base"""
        if self.__python3_minimal_stage.is_enabled():
            self.__python3_minimal_stage.click()
            return True
        return False

    def click_projects_menu(self) -> bool:
        """Click action for selecting projects from menu"""
        if self.__projects_menu.is_enabled():
            self.__projects_menu.click()
            return True
        return False

    def monitor_container_status(self, compare_text: str, wait_timeout: int) -> bool:
        """Monitors the current container status."""
        is_status_changed = self.project_container_status_component.monitor_container_status(compare_text, wait_timeout)
        return is_status_changed

    def click_container_status(self) -> bool:
        """Clicks container status which changes the state."""
        is_clicked = self.project_container_status_component.click_container_status()
        return is_clicked

    def move_to_element(self) -> None:
        """Moves to a temporary element just to change the mouse focus."""
        ActionChains(self.driver).move_to_element(self.__project_title).click().perform()

    def compare_project_title(self, position, title) -> bool:
        """Compares the project title in arg with UI"""
        return self.__project_name_from_list.get_text() == title

    def click_got_it_button(self) -> bool:
        """Clicks on got it button"""
        if self.__click_got_it_button.is_enabled():
            self.__click_got_it_button.click()
            return True
        return False

    def click_helper_guide_slider(self) -> bool:
        """Clicks on helper guide slider"""
        if self.__click_helper_guide_slider.is_enabled():
            self.__click_helper_guide_slider.click()
            return True
        return False

    def click_helper_close_button(self) -> bool:
        """Clicks on helper close button"""
        if self.__click_helper_close_button.is_enabled():
            self.__click_helper_close_button.click()
            return True
        return False

    def is_active_helper_guide_slider(self) -> bool:
        """Check for guide slider state"""
        agent = self.driver.capabilities['browserName']
        css_property = None

        if agent == 'chrome':
            css_property = "background"
        elif agent == 'firefox':
            css_property = "background-image"

        slider_background = self.__click_helper_guide_slider.value_of_css_property(css_property)
        if "url" in slider_background:
            return True
        return False