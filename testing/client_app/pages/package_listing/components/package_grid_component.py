from framework.base.component_base import BaseComponent
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel
from framework.factory.models_enums.constants_enums import LocatorType


class PackageGridComponent(BaseComponent):
    """ Represents one of the components while viewing the package lists .

    Holds a set of all locators within grid for each project package as an entity. Helps in iterating through the
    package details in the grid Handles events and test functions of locators
    """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(PackageGridComponent, self).__init__(driver, component_data)
        self.package_body_title = self.get_locator(LocatorType.XPath, "//div[@data-selenium-id='PackageCard']"
                                                                      "/div[@data-selenium-id='PackageBody']")
        self.add_package_button = self.get_locator(LocatorType.XPath, "//div[@data-selenium-id='PackageCard']"
                                                                      "/button[contains(text(),'Add Package')]")

    def get_package_body_title(self) -> str:
        """ Locate the the text on package body

        Returns: returns the package body text as a string

        """
        return self.package_body_title.get_text()

    def click_add_package_button(self) -> bool:
        """Performs click action on add package button

        Returns: returns the result of click action

        """
        if self.add_package_button is not None:
            self.add_package_button.click()
            return True
        return False

    def verify_package_list(self, package_details_list: list) -> bool:
        """Verify all installed packages

        Args:
            package_details_list: Details of packages

        Returns: returns the comparison result

        """
        package_list = self.ui_element.find_elements_by_xpath("//div[@data-selenium-id='PackageRow']")
        if package_list is not None:
            # Iterate the page elements corresponding to package details
            agent = self.driver.capabilities['browserName']
            for index, package in enumerate(package_list):
                package_detail = package.text.split('\n')
                if agent.lower() in ['chrome', 'firefox']:
                    package_name, package_version = package_detail[1], package_detail[3]
                    # Compare package-details on page with the package-details from argument
                    if package_name == package_details_list[index].name and package_version == \
                            package_details_list[index].version:
                        return True
                elif agent.lower() == 'safari':
                    # Safari returns a single string with no delimiters so check in a less strict way
                    # by just seeing if the name and version are in the string
                    if package_details_list[index].name in package_detail[0] and \
                            package_details_list[index].version in package_detail[0]:
                        return True
        return False

    def check_package_update(self, package_name: str, check_string: str) -> bool:
        """Check for the package update

        Args:
            package_name: Name of the package
            check_string: String to compare

        Returns: returns the comparison result

        """
        package_list = self.ui_element.find_elements_by_xpath("//div[@data-selenium-id='PackageRow']")
        if package_list is not None:
            for package in package_list:
                package_title = package.text.split('\n')[1]
                if package_title == package_name:
                    update_text = package.find_element_by_xpath(".//div[@data-selenium-id='PackageActions']/button[1]")
                    if update_text.getAttribute("data-tooltip") == check_string:
                        return True
        return False

    def click_update_package_button(self) -> bool:
        """Performs click action on Update Package button

        Returns: returns the result of click action

        """
        update_button = self.get_locator(LocatorType.XPath, "//button[@data-tooltip='Update Package']")
        if update_button is not None and update_button.element_to_be_clickable():
            update_button.execute_script("arguments[0].click();")
            return True
        return False
