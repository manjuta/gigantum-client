import re
from selenium.webdriver.remote.webelement import WebElement
from framework.base.page_base import BasePage
from framework.factory.models_enums.constants_enums import LocatorType
from framework.factory.models_enums.page_config import PageConfig
from client_app.pages.project_listing.components.project_container_status_component \
    import ProjectContainerStatusComponent
from selenium.webdriver.common.action_chains import ActionChains


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
        self.__textarea_command = None
        self.__div_run_cell = None
        self.__div_package_version = None

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
    def __type_textarea_command(self) -> WebElement:
        if self.__textarea_command is None:
            self.__textarea_command = self.get_locator(LocatorType.CSS, ".jp-Notebook .CodeMirror")
        return self.__textarea_command

    @property
    def __click_run_cell(self) -> WebElement:
        if self.__div_run_cell is None:
            self.__div_run_cell = self.get_locator(LocatorType.XPath,
                                                   "//div[@class='lm-Widget p-Widget jp-Toolbar "
                                                   "jp-NotebookPanel-toolbar']/div[6]")
        return self.__div_run_cell

    @property
    def __check_package_version(self) -> WebElement:
        if self.__div_package_version is None:
            self.__div_package_version = self.get_locator(LocatorType.XPath,
                                                          "//div[@class='lm-Widget p-Widget jp-RenderedText "
                                                          "jp-mod-trusted "
                                                          "jp-OutputArea-output']/pre")
        return self.__div_package_version

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

    def type_command(self, command: str) -> bool:
        """ Clicks the textarea meant for command"""
        try:
            # Scroll to top of notebook internal scrollbar
            self.__type_textarea_command.click()
            agent = self.driver.capabilities['browserName']
            if agent.lower() in ['chrome', 'firefox']:
                self.__type_textarea_command.find_element_by_tag_name("textarea").send_keys(command)
            elif agent.lower() == 'safari':
                self.__type_textarea_command.send_keys(command)
            else:
                raise ValueError(f"Unsupported browser type while entering command in jupyterlab: {agent}")
            return True
        except:
            return False

    def click_run_cell(self) -> bool:
        """ Clicks the run cell"""
        if self.__click_run_cell.is_enabled():
            self.__click_run_cell.click()
            return True
        return False

    def check_packages_version(self, package_list: list) -> bool:
        """ Checks the package version """
        if self.__check_package_version.is_displayed():
            installed_package_output = self.__check_package_version.text
            packages = re.split('[\n]', installed_package_output)
            for package in package_list:
                if package not in packages:
                    return False
        return True

    def close_tab(self, url, parent_tab) -> bool:
        """ Closes current tab and switches to parent"""
        return self.close_current_tab(url, parent_tab)
