import re
from selenium.webdriver.remote.webelement import WebElement
from framework.base.page_base import BasePage
from framework.factory.models_enums.constants_enums import LocatorType
from framework.factory.models_enums.page_config import PageConfig
from client_app.pages.project_listing.components.project_container_status_component \
    import ProjectContainerStatusComponent
from selenium.webdriver.common.action_chains import ActionChains
from framework.factory.models_enums.constants_enums import CompareUtilityType


class JupyterLabPage(BasePage):
    """Represents the jupyter-lab page of gigantum client.

    Holds the locators on the jupyter-lab page of gigantum client. The locators can be
    presented in its corresponding component or directly on the page. Test functions can
    use these objects for all activities and validations and can avoid those in the
    test functions.
    """

    def __init__(self, driver) -> None:
        page_config = PageConfig()
        super(JupyterLabPage, self).__init__(driver, page_config)
        self.__div_jupyter_lab = None
        self.__div_python3_notebook = None
        self.__div_project_title = None
        self.__div_run_cell = None

    @property
    def __click_div_jupyter_lab(self) -> WebElement:
        if self.__div_jupyter_lab is None:
            self.__div_jupyter_lab = self.get_locator(LocatorType.XPath, "//div[@class='DevTools__flex']")
        return self.__div_jupyter_lab

    @property
    def __click_div_python3_notebook(self) -> WebElement:
        if self.__div_python3_notebook is None:
            self.__div_python3_notebook = self.get_locator(LocatorType.CSS, ".jp-LauncherCard-icon")
        return self.__div_python3_notebook

    @property
    def __click_run_cell(self) -> WebElement:
        if self.__div_run_cell is None:
            self.__div_run_cell = self.get_locator(LocatorType.XPath,
                                                   "//div[@class='lm-Widget p-Widget jp-Toolbar "
                                                   "jp-NotebookPanel-toolbar']/div[6]")
        return self.__div_run_cell

    @property
    def __project_title(self) -> WebElement:
        """UI element for project title label"""
        if self.__div_project_title is None:
            self.__div_project_title = self.get_locator(LocatorType.XPath,
                                                        "//div[@class='TitleSection__namespace-title']")
        return self.__div_project_title

    def monitor_container_status(self, compare_text: str, wait_timeout: int) -> bool:
        """ Monitors the current container status."""
        is_status_changed = ProjectContainerStatusComponent(self.driver).monitor_container_status(compare_text, wait_timeout)
        return is_status_changed

    def click_container_status(self) -> bool:
        """ Clicks container status which changes the state."""
        is_clicked = ProjectContainerStatusComponent(self.driver).click_container_status()
        return is_clicked

    def move_to_element(self) -> None:
        """ Moves to a temporary element just to change the mouse focus."""
        ActionChains(self.driver).move_to_element(self.__project_title).click().perform()

    def click_jupyterlab_div(self) -> bool:
        """ Clicks the launch jupyter div"""
        if self.__click_div_jupyter_lab.is_enabled():
            self.__click_div_jupyter_lab.click()
            return True
        return False

    def wait_for_url_in_new_tab(self, url: str, window_index: int, time_out: int) -> bool:
        """ Waits for a new tab to load """
        return self.wait_for_new_tab_to_load(url, window_index, time_out)

    def click_python3_notebook(self) -> bool:
        """ Clicks the Python3 notebook"""
        if self.__click_div_python3_notebook.is_enabled() and \
                self.__click_div_python3_notebook.element_to_be_clickable():
            self.__click_div_python3_notebook.click()
            return True
        return False

    def type_command(self, command: str, input_position: int) -> bool:
        """ Clicks the textarea and type the command

        Args:
            command: Command to be typed
            input_position: Position of the input textarea in UI

        Returns: returns the result of command type action

        """
        element = f"//body/div[@id='main']/div[@id='jp-main-content-panel']/div[@id='jp-main-split-panel']/div" \
                  f"[@id='jp-main-dock-panel']/div/div/div[{input_position}]/div[2]/div[2]/div[2]/" \
                  f"div[1]"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            type_textarea_command = self.get_locator(LocatorType.XPath, element)
            type_textarea_command.click()
            agent = self.driver.capabilities['browserName']
            if agent.lower() in ['chrome', 'firefox']:
                type_textarea_command.find_element_by_tag_name("textarea").send_keys(command)
            elif agent.lower() == 'safari':
                type_textarea_command.send_keys(command)
            else:
                raise ValueError(f"Unsupported browser type while entering command in jupyterlab: {agent}")
            return True
        return False

    def click_run_cell(self) -> bool:
        """ Clicks the run cell"""
        if self.__click_run_cell.is_enabled():
            self.__click_run_cell.click()
            return True
        return False

    def is_jupyter_notebook_output_exist(self, expected_output: list, output_position: int) -> bool:
        """ Checks whether the expected output are present in the jupyter notebook output

        Args:
            expected_output: List of expected output
            output_position: Position of the output area in UI

        Returns: returns the result of output verification

        """
        jupyter_notebook_output = self.__get_jupyter_notebook_output(output_position)
        if expected_output:
            for output in expected_output:
                if output not in jupyter_notebook_output:
                    return False
            return True
        else:
            return False if jupyter_notebook_output else True

    def __get_jupyter_notebook_output(self, output_position: int) -> list:
        """ Function returns output from the jupyter notebook output area

        Args:
            output_position: Position of the output area in UI

        Returns: returns the jupyter notebook output as list

        """
        element = f"//body/div[@id='main']/div[@id='jp-main-content-panel']/div[@id='jp-main-split-panel']" \
                  f"/div[@id='jp-main-dock-panel']/div/div/div[{output_position}]/div[3]/div[2]/div[1]/div[2]"
        if self.check_element_presence(LocatorType.XPath, element, 30):
            command_output_area = self.get_locator(LocatorType.XPath, element)
            # Wait until the 'Note:' appears in output
            command_output_area.wait_until(CompareUtilityType.CheckContainsText, 10, 'Note:')
            command_output_text = command_output_area.text
            command_output = (re.split('[\n]', command_output_text))
            if command_output[-1].startswith('Note:'):
                del command_output[-1]
            return command_output
        return []

    def is_jupyter_notebook_output_only_exist(self, expected_output: list, output_position: int) -> bool:
        """ Check only the expected output are present in the jupyter notebook output

        Args:
            expected_output: List of expected output
            output_position: Position of the output area in UI

        Returns: returns the result of output verification

        """
        jupyter_notebook_output = self.__get_jupyter_notebook_output(output_position)
        if len(jupyter_notebook_output) == len(expected_output):
            for index, output_line in enumerate(expected_output):
                if output_line not in jupyter_notebook_output:
                    return False
            return True
        return False

    def close_tab(self, url, parent_tab) -> bool:
        """ Closes current tab and switches to parent"""
        return self.close_current_tab(url, parent_tab)
