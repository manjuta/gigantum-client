"""
Base call to handle UI elements and its events
Copy from selenium GIT
"""
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import *
from selenium.webdriver import ActionChains
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.ui import Select
from framework.factory.models_enums.constants_enums import LocatorType, CompareUtilityType
import time
import pkg_resources
from framework.factory.compare_utility import CompareUtility
import tempfile
import os


class PageFactory(object):
    timeout = 900
    highlight = True

    TYPE_OF_LOCATORS = {
        'css': By.CSS_SELECTOR,
        'id': By.ID,
        'name': By.NAME,
        'xpath': By.XPATH,
        'link_text': By.LINK_TEXT,
        'partial_link_text': By.PARTIAL_LINK_TEXT,
        'tag': By.TAG_NAME,
        'class_name': By.CLASS_NAME
    }

    def __init__(self) -> None:
        pass

    def __get__(self, instance, owner) -> None:
        if not instance:
            return None
        else:
            self.driver = instance.driver

    def wait_for_new_tab_to_load(self, url: str, window_index: int = 1, timeout: int = 15) -> bool:
        end_time = time.time() + timeout
        while time.time() < end_time:
            if len(self.driver.window_handles) > 1 and len(self.driver.window_handles) >= window_index:
                new_window = self.driver.window_handles[window_index]
                self.driver.switch_to_window(new_window)
                if self.driver.current_url.endswith(url):
                    return True
            time.sleep(0.25)
        return False

    def close_current_tab(self, current_window_url: str, parent_window_index: int) -> bool:
        if len(self.driver.window_handles) > 1 and self.driver.current_url.endswith(current_window_url):
            parent_window = self.driver.window_handles[parent_window_index]
            self.driver.close()
            self.driver.switch_to_window(parent_window)
            return True
        return False

    def get_locator(self, locator_type: LocatorType, locator_key: str) -> WebElement:
        """Get UI element based on given locator type and locator key.

        Args:
            locator_type: locator type ('css','id','name','xpath','link_text','partial_link_text','tag','class_name')
            locator_key: unique key to identify we UI element

        Returns: WebElement
        """
        self.element_locator = (self.TYPE_OF_LOCATORS[locator_type.value], locator_key)
        try:
            element = WebDriverWait(self.driver, self.timeout).until(EC.presence_of_element_located(
                self.element_locator))
        except (StaleElementReferenceException, NoSuchElementException, TimeoutException) as ex:
            raise Exception(f"An exception of type {type(ex).__name__} occurred. With Element Locator -: {locator_key}")
        try:
            element = WebDriverWait(self.driver, self.timeout).until(EC.visibility_of_element_located(
                self.element_locator))
        except() as ex:
            raise Exception(f"An exception of type {type(ex).__name__} occurred. With Element Locator -: {locator_key}")
        element = self.get_web_element(*self.element_locator)
        element._locator = self.element_locator
        return element

    def get_web_element(self, *loc):
        """Gets the web element.

        Args:
            *loc: reference of locator

        Returns:  WebElement
        """
        element = self.driver.find_element(*loc)
        self.highlight_web_element(element)
        return element

    def highlight_web_element(self, element) -> None:
        """Highlight the selected UI element."

        Args:
            element: WebElement
        """
        if self.highlight:
            self.driver.execute_script("arguments[0].style.border='2px ridge #33ffff'", element)

    def select_element_by_text(self, text) -> None:
        """Select webElement from dropdown list.

        Args:
            text: Text of Item in dropdown
        """
        select = Select(self)
        select.select_by_visible_text(text)

    def select_element_by_index(self, index) -> None:
        """Select webElement from dropdown list.

        Args:
            index: Index of Item in dropdown.
        """
        select = Select(self)
        select.select_by_index(index)

    def select_element_by_value(self, value) -> None:
        """Select webElement from dropdown list.

        Args:
            value: value of Item in dropdown
        """
        select = Select(self)
        select.select_by_value(value)

    def get_list_item_count(self):
        """Gets the count of Item from Dropdown."""
        select = Select(self)
        return len(select.options)

    def get_all_list_item(self):
        """ Get list of Item from Dropdown"""
        select = Select(self)
        list_item = []
        for item in select.options:
            list_item.append(item.text)
        return list_item

    def get_list_selected_item(self):
        """Get list of Selected item in Dropdown."""
        select = Select(self)
        list_item = []
        for item in select.all_selected_options:
            list_item.append(item.text)
        return list_item

    def click(self):
        """Performs click on webElement.

        Returns: WebElement
        """
        self.element_to_be_clickable()
        self.click()
        return self

    def double_click(self):
        """Perform Double click on webElement.

        Returns: WebElement
        """
        self.element_to_be_clickable()
        ActionChains(self.parent).double_click(self).perform()
        return self

    def context_click(self):
        """Performs Right click on webElement.

        Returns: WebElement
        """
        self.element_to_be_clickable()
        ActionChains(self.parent).context_click(self).perform()
        return self

    def set_text(self, value):
        """Types text in input box.

        Args:
            value: Text to be Entered

        Returns: WebElement
        """
        self.element_to_be_clickable()
        self.clear_text()
        self.send_keys(value)
        return self

    def get_text(self):
        """Gets text from input box.

        Returns: text from webElement.
        """
        return self.text

    def clear_text(self) -> None:
        """Clears text from EditBox."""
        self.clear()

    def hover(self) -> None:
        """Perform hover operation on webElement."""
        ActionChains(self.parent).move_to_element(self).perform()

    def is_Checked(self):
        """Returns value based on selection of Radio button / CheckBox"""
        return self.isSelected()

    def is_Enabled(self):
        """Returns Enable state of webElement."""
        return self.isEnabled()

    def getAttribute(self, attributeName):
        """Gets webElement attribute.

        Args:
            attributeName: name of Attribute

        Returns WebElement attribute value
        """
        return self.get_attribute(attributeName)

    def w3c(self):
        return self.w3c

    def element_to_be_clickable(self, timeout=None):
        """Wait till the element to be clickable.

        Args:
            timeout: timeout interval to click the web element.
        """
        if timeout is None:
            timeout = PageFactory().timeout
        return WebDriverWait(self.parent, timeout).until(
            EC.element_to_be_clickable(self._locator)
        )

    def invisibility_of_element_located(self, timeout=None)  -> None:
        """Wait till the element gets invisible

        Args:
            timeout: timeout interval to hide the web element.
        """
        if timeout is None:
            timeout = PageFactory().timeout
        return WebDriverWait(self.parent, timeout).until(
            EC.invisibility_of_element_located(self._locator)
        )

    def visibility_of_element_located(self, timeout=None) -> None:
        """Wait till the element gets visible.

        Args:
            timeout: timeout interval to show the web element
        """
        if timeout is None:
            timeout = PageFactory().timeout
        return WebDriverWait(self.parent, timeout).until(
            EC.visibility_of(self)
        )

    def execute_script(self, script):
        """Execute JavaScript using web driver on selected web element.

        Args:
            script: Javascript to be execute
        """
        return self.parent.execute_script(script, self)

    def drag_drop_text_file_in_drop_zone(self, sleep_time: int = 5, file_content: str = "sample text",
                                         file_name: str = 'requirements.txt'):
        """Drag and drop a file into a file browser drop zone.

        Args:
            sleep_time: timeout interval to drop file
            file_content: content of the file
            file_name: name of the file
        """
        with open(pkg_resources.resource_filename('framework', 'factory/resources/file_browser_drag_drop_script.js'), "r") \
                as js_file:
            js_script = js_file.read()
        temp_dir = tempfile.gettempdir()
        with open(os.path.join(temp_dir, file_name), 'w') as temp_file:
            temp_file.write(file_content)
        file_path = os.path.join(temp_dir, file_name)
        file_input = self.execute_script(js_script)
        file_input.send_keys(file_path)
        time.sleep(sleep_time)

    def wait_until(self, predicate: CompareUtilityType, timeout: int, *args) -> bool:
        """Monitor the ui element for a change

        The function can return once the timeout period is reached or if it finds the
        required element.

        Args:
            predicate: Indicates the function to execute while wait period.
            timeout: The time period for which the wait should continue.
            *args:Input to predicate.

        Returns: boolean value based on the result
        """
        end_time = time.time() + timeout
        while time.time() < end_time:
            if getattr(CompareUtility, predicate.value)(self, *args): return True
            time.sleep(0.25)
        return False

    def check_element_presence(self, locator_type: LocatorType, locator_key: str, timeout: int) -> bool:
        """Check for the presence of an element

        Args:
            locator_type: locator type ('css','id','name','xpath','link_text','partial_link_text','tag','class_name')
            locator_key: unique key to identify we UI element
            timeout: The time period for which the wait should continue

        Returns: boolean value based on the result

        """
        end_time = time.time() + timeout
        self.element_locator = (self.TYPE_OF_LOCATORS[locator_type.value], locator_key)
        while time.time() < end_time:
            try:
                element = WebDriverWait(self.driver, 0.15).until(EC.presence_of_element_located(
                    self.element_locator))
                return True
            except (StaleElementReferenceException, NoSuchElementException, TimeoutException) as ex:
                pass
        return False

    def check_element_absence(self, locator_type: LocatorType, locator_key: str, timeout: int) -> bool:
        """Check for the absence of an element

                Args:
                    locator_type: locator type ('css','id','name','xpath','link_text','partial_link_text','tag','class_name')
                    locator_key: unique key to identify we UI element
                    timeout: The time period for which the wait should continue

                Returns: boolean value based on the result

                """
        end_time = time.time() + timeout
        self.element_locator = (self.TYPE_OF_LOCATORS[locator_type.value], locator_key)
        while time.time() < end_time:
            try:
                element = WebDriverWait(self.driver, 0.15).until(EC.presence_of_element_located(
                    self.element_locator))
            except (StaleElementReferenceException, NoSuchElementException, TimeoutException) as ex:
                return True
        return False


WebElement.click_button = PageFactory.click
WebElement.double_click = PageFactory.double_click
WebElement.context_click = PageFactory.context_click
WebElement.element_to_be_clickable = PageFactory.element_to_be_clickable
WebElement.invisibility_of_element_located = PageFactory.invisibility_of_element_located
WebElement.visibility_of_element_located = PageFactory.visibility_of_element_located
WebElement.set_text = PageFactory.set_text
WebElement.get_text = PageFactory.get_text
WebElement.hover = PageFactory.hover
WebElement.clear_text = PageFactory.clear_text
WebElement.w3c = PageFactory.w3c
WebElement.is_Checked = PageFactory.is_Checked
WebElement.is_Enabled = PageFactory.is_Enabled
WebElement.getAttribute = PageFactory.getAttribute
WebElement.select_element_by_text = PageFactory.select_element_by_text
WebElement.select_element_by_index = PageFactory.select_element_by_index
WebElement.select_element_by_value = PageFactory.select_element_by_value
WebElement.get_list_item_count = PageFactory.get_list_item_count
WebElement.get_all_list_item = PageFactory.get_all_list_item
WebElement.get_list_selected_item = PageFactory.get_list_selected_item
WebElement.execute_script = PageFactory.execute_script
setattr(WebElement, 'wait_until', PageFactory.wait_until)
setattr(WebElement, 'drag_drop_file_in_drop_zone', PageFactory.drag_drop_text_file_in_drop_zone)


