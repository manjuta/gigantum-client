from selenium.webdriver.remote.webelement import WebElement
from client_app.pages.package_listing.components.package_grid_component import PackageGridComponent
from client_app.pages.package_listing.components.add_package_component import AddPackageComponent
from framework.base.page_base import BasePage
from framework.factory.models_enums.constants_enums import LocatorType
from framework.factory.models_enums.page_config import PageConfig
from framework.factory.models_enums.page_config import ComponentModel
from client_app.pages.project_listing.components.project_container_status_component \
    import ProjectContainerStatusComponent


class PackageListingPage(BasePage):
    """Represents the package-listing page of gigantum client.

    Holds the locators on the package-listing page of gigantum client. The locators can be
    presented in its corresponding component or directly on the page. Test functions can
    use these objects for all activities and validations and can avoid those in the
    test functions.
    """

    def __init__(self, driver) -> None:
        page_config = PageConfig()
        super(PackageListingPage, self).__init__(driver, page_config)
        self.__environment_tab = None
        self.__package_listing_component = None
        self.__add_package_component = None
        self.__package_grid_model = ComponentModel(locator_type=LocatorType.XPath, locator="//div[@class='grid']")
        self.__add_package_model = ComponentModel(locator_type=LocatorType.XPath,
                                                  locator="//div[@data-selenium-id='AddPackages']")

    @property
    def package_listing_component(self) -> PackageGridComponent:
        """Returns instance of PackageGridComponent class"""
        if self.__package_listing_component is None:
            self.__package_listing_component = PackageGridComponent(self.driver, self.__package_grid_model)
        return self.__package_listing_component

    @property
    def add_package_component(self) -> AddPackageComponent:
        """Returns instance of AddPackageComponent class"""
        if self.__add_package_component is None:
            self.__add_package_component = AddPackageComponent(self.driver, self.__add_package_model)
        return self.__add_package_component

    @property
    def __click_environment_tab(self) -> WebElement:
        """ UI element for environment tab """
        if self.check_element_presence(LocatorType.XPath, "//li[@id='environment']", 30):
            if self.__environment_tab is None:
                self.__environment_tab = self.get_locator(LocatorType.XPath, "//li[@id='environment']")
            return self.__environment_tab

    def click_environment_button(self) -> bool:
        """Perform click action on Environment Tab"""
        if self.__click_environment_tab.is_enabled():
            self.__click_environment_tab.click()
            return True
        return False

    def get_package_body_text(self) -> str:
        """ Locates the package body and returns its text"""
        body_text = self.package_listing_component.get_package_body_title()
        return body_text

    def click_add_package(self) -> bool:
        """ Performs click action on add package button"""
        return self.package_listing_component.click_add_package_button()

    def type_package_name(self, package_name: str) -> bool:
        """ Input action for package name

        Args:
            package_name: Name of the package
        """
        return self.add_package_component.input_package_name(package_name)

    def click_add(self) -> bool:
        """Performs click action on add button"""
        return self.add_package_component.click_add_button()

    def verify_packages(self, package: tuple) -> bool:
        """Verify packages and it's version

        Args:
            package: Tuple with package name and it's version

        Returns: Returns the comparison result
        """
        return self.add_package_component.verify_package_and_version(package)

    def type_package_name_and_version(self, package_name, version) -> bool:
        """Input action for package name and version

        Args:
            package_name: Name of the package
            version: Version of the package

        Returns: Returns the result of input action
        """
        is_package_typed = self.add_package_component.input_package_name(package_name)
        is_version_typed = self.add_package_component.input_package_version(version)
        if is_package_typed and is_version_typed:
            return True
        return False

    def click_install_all_packages(self) -> bool:
        """ Clicks Install all button"""
        return self.add_package_component.click_install_all_packages()

    def verify_package_listing(self, package_list: list) -> bool:
        """Verify packages and it's version in package listing page

        Args:
            package_list: List of package details

        Returns: Returns the comparison result
        """
        return self.__package_listing_component.verify_package_list(package_list)

    def monitor_build_modal(self, wait_time: int) -> bool:
        """ Monitors if build modal appears or not

        Args:
            wait_time: Time period for which the wait should continue

        Returns: Returns the monitor result
        """
        element = "//div[@class='BuildProgress__header']"
        return self.check_element_presence(LocatorType.XPath, element, wait_time)

    def check_package_update(self, package_name: str, check_string: str) -> bool:
        """Performs checking of package update.

        Args:
            package_name: Name of the package
            check_string: Text to be compared

        Returns: Returns the comparison result
        """
        return self.__package_listing_component.check_package_update(package_name, check_string)

    def check_build_modal_closed(self, wait_time: int) -> bool:
        """Monitor build modal closed or not

        Args:
            wait_time: Time period for which the wait should continue

        Returns: returns the monitor result

        """
        element = "//div[@class='BuildProgress__header']"
        return self.check_element_absence(LocatorType.XPath, element, wait_time)

    def click_update_package(self) -> bool:
        """ Clicks on Update Package button"""
        return self.package_listing_component.click_update_package_button()

    def monitor_container_status(self, compare_text: str, wait_timeout: int) -> bool:
        """ Monitors the current container status."""
        is_status_changed = ProjectContainerStatusComponent(self.driver).monitor_container_status(compare_text, wait_timeout)
        return is_status_changed

