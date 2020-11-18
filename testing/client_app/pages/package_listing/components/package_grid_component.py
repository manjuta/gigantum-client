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
                    if package_name != package_details_list[index].name or package_version != \
                            package_details_list[index].version:
                        return False
                elif agent.lower() == 'safari':
                    # Safari returns a single string with no delimiters so check in a less strict way
                    # by just seeing if the name and version are in the string
                    if package_details_list[index].name not in package_detail[0] or \
                            package_details_list[index].version not in package_detail[0]:
                        return False
        return True

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

    def delete_package(self, package_name) -> bool:
        """Performs deletion of a package

        Args:
            package_name: Name of the package to be remove

        Returns: returns the result of delete operation

        """
        package_list = self.ui_element.find_elements_by_xpath("//div[@data-selenium-id='PackageRow']")
        if package_list is not None:
            for package in package_list:
                selected_package = package.text.split('\n')
                package_title = selected_package[1] if len(selected_package) > 0 else ''
                if package_title == package_name:
                    delete_button = package.find_element_by_xpath(".//div[@data-selenium-id='PackageActions']/button[2]")
                    if delete_button is not None:
                        delete_button.execute_script("arguments[0].click();")
                        return True
        return False

    def delete_all_packages(self) -> bool:
        """Performs deletion of all packages

        Returns: returns the result of delete operation

        """
        multi_select_checkbox = self.get_locator(LocatorType.XPath, "//div[@class='PackageHeader__multiselect']/button")
        if multi_select_checkbox is not None and multi_select_checkbox.element_to_be_clickable():
            multi_select_checkbox.execute_script("arguments[0].click();")
            element = "//button[contains(text(),'Delete')]"
            check_element = self.check_element_presence(LocatorType.XPath, element, 20)
            if check_element:
                # Delete button element is located in the index number 1
                delete_button = self.ui_element.find_elements_by_xpath("//button[contains(text(),'Delete')]")[1]
                if delete_button is not None:
                    delete_button.execute_script("arguments[0].click();")
                    return True
        return False

    def check_package(self, package_details: tuple) -> bool:
        """Check for a package and it's version

        Args:
            package_details: Name of the package

        Returns: returns the result of check verify package

        """
        # TODO: write a separate method for package comparison while testing in safari
        package_list = self.ui_element.find_elements_by_xpath("//div[@data-selenium-id='PackageRow']")
        if package_list is not None:
            # Iterate through page elements
            for package in package_list:
                package_detail = package.text.split('\n')
                package_name = package_detail[1]
                package_version = package_detail[3]
                # Compare package-details on page with the package-details from argument
                if package_name == package_details.name and package_version == package_details.version:
                    return True
        return False

    def click_advanced_configuration_settings(self) -> bool:
        """Performs click action on Advanced configuration settings

        Returns: returns the result of click action

        """
        element = "//button[contains(text(),'Advanced Configuration Settings')]"
        if self.check_element_presence(LocatorType.XPath, element, 20):
            configuration_button = self.get_locator(LocatorType.XPath, element)
            configuration_button.execute_script("arguments[0].click();")
            return True
        return False

    def click_edit_dockerfile_button(self) -> bool:
        """Performs click action on edit dockerfile button

        Returns: returns the result of click action

        """
        element = "//button/span[contains(text(),'Edit Dockerfile')]"
        if self.check_element_presence(LocatorType.XPath, element, 20):
            dockerfile_button = self.get_locator(LocatorType.XPath, element)
            dockerfile_button.execute_script("arguments[0].click();")
            return True
        return False

    def click_and_input_docker_text_area(self, command) -> bool:
        """Performs click action and input command to docker text area

        Args:
            command: Command to be executed

        Returns: returns the result of command input action

        """
        element = f"//textarea[@placeholder='Enter dockerfile commands here']"
        if self.check_element_presence(LocatorType.XPath, element, 20):
            docker_text_area = self.get_locator(LocatorType.XPath, element)
            docker_text_area.execute_script("arguments[0].click();")
            docker_text_area.send_keys(command)
            return True
        return False

    def click_save_button(self) -> bool:
        """Performs click action on save button

        Returns: return the result of click action

        """
        element = "//button[contains(text(),'Save')]"
        if self.check_element_presence(LocatorType.XPath, element, 20):
            save_button = self.get_locator(LocatorType.XPath, element)
            if save_button.element_to_be_clickable():
                save_button.execute_script("arguments[0].click();")
            return True
        return False

    def scroll_to_element(self) -> bool:
        """Scroll down the window to Advanced configuration settings button

        Returns: returns the result of scroll action

        """
        element = "//button[contains(text(),'Advanced Configuration Settings')]"
        if self.check_element_presence(LocatorType.XPath, element, 20):
            save_button = self.get_locator(LocatorType.XPath, element)
            self.driver.execute_script("arguments[0].scrollIntoView(true);", save_button)
            return True
