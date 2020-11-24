"""

Module consist setup, teardown amd generate failure test screenshot

"""
import os
import datetime
import pytest
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from configuration.configuration import ConfigurationManager
from webdriver_manager.utils import ChromeType
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import platform
from msedge.selenium_tools import Edge, EdgeOptions


@pytest.yield_fixture(params=ConfigurationManager.getInstance().get_app_setting("browsers"), scope="class",
                      autouse=True)
def setup(request):
    """Setup and teardown function for each test.

    Args:
        request: Instance of requested test class
    """
    web_driver = __setup_driver(request.param)
    request.cls.driver = web_driver
    failed_before = request.session.testsfailed
    yield
    if request.session.testsfailed != failed_before:
        test_name = request.node.name
        __take_screenshot(web_driver, test_name)
    web_driver.close()
    web_driver.quit()


def __setup_driver(driver_type: str) -> webdriver:
    """Generate web driver instance based on given browser type.

    Args:
        driver_type: type of driver.

    Returns:
        Instance of web driver.
    """
    if driver_type == "chrome":
        return __setup_chrome()
    if driver_type == "edge":
        return __setup_edge()
    if driver_type == "safari":
        return __setup_safari()
    if driver_type == "firefox":
        return __setup_firefox()


def __setup_chrome() -> webdriver:
    """Setup chrome web driver.

    Returns: A new local chrome driver.
    """
    chrome_prefs = {}
    chrome_options = webdriver.ChromeOptions()
    if ConfigurationManager.getInstance().get_app_setting("headless"):
        chrome_options.add_argument("headless")
    if ConfigurationManager.getInstance().get_app_setting("window_size"):
        window_size = ConfigurationManager.getInstance().get_app_setting("window_size")
        chrome_options.add_argument(f"--window-size={window_size}")
    if ConfigurationManager.getInstance().get_app_setting("incognito"):
        chrome_options.add_argument("--incognito")
    if platform.system() == "Darwin" or platform.system() == "Linux":
        chrome_options.add_argument("--kiosk")
    else:
        chrome_options.add_argument("--start-maximized")
    chrome_options.experimental_options["prefs"] = chrome_prefs
    chrome_prefs["profile.default_content_settings"] = {"popups": 1}
    driver_version = ConfigurationManager.getInstance().get_app_setting("chrome_driver_version")
    if driver_version.strip():
        return webdriver.Chrome(ChromeDriverManager
                                (version=driver_version,
                                 chrome_type=ChromeType.GOOGLE).install(),
                                chrome_options=chrome_options)
    else:
        return webdriver.Chrome(ChromeDriverManager
                                (chrome_type=ChromeType.GOOGLE).install(),
                                chrome_options=chrome_options)


def __setup_firefox() -> webdriver:
    """Setup firefox web driver.

    Returns: A new local firefox driver
    """
    firefox_profile = webdriver.FirefoxProfile()
    firefox_profile.set_preference("browser.privatebrowsing.autostart",
                                   ConfigurationManager.getInstance().get_app_setting("incognito"))
    firefox_profile.set_preference("dom.disable_open_during_load", False)
    firefox_options = webdriver.FirefoxOptions()
    if ConfigurationManager.getInstance().get_app_setting("headless"):
        firefox_options.add_argument('-headless')
    driver = webdriver.Firefox(executable_path=GeckoDriverManager().install(), firefox_profile=firefox_profile,
                               firefox_options=firefox_options)
    driver.maximize_window()
    return driver


def __setup_edge() -> webdriver:
    """Setup edge web driver.

    Returns: A new local edge driver.
    """
    edge_options = EdgeOptions()
    edge_options.use_chromium = True
    capability = DesiredCapabilities.EDGE
    capability["se:ieOptions"] = {}
    if ConfigurationManager.getInstance().get_app_setting("incognito"):
        capability["se:ieOptions"]['ie.forceCreateProcessApi'] = True
        capability["se:ieOptions"]['ie.browserCommandLineSwitches'] = '-private'
        capability["se:ieOptions"]["ie.ensureCleanSession"] = True
    if ConfigurationManager.getInstance().get_app_setting("headless"):
        edge_options.add_argument("headless")
    if ConfigurationManager.getInstance().get_app_setting("window_size"):
        window_size = ConfigurationManager.getInstance().get_app_setting("window_size")
        edge_options.add_argument(f"--window-size={window_size}")
    driver_version = ConfigurationManager.getInstance().get_app_setting("edge_driver_version")
    if driver_version.strip():
        driver = Edge(EdgeChromiumDriverManager(driver_version).install(), capabilities=capability,
                      options=edge_options)
    else:
        driver = Edge(EdgeChromiumDriverManager().install(), capabilities=capability, options=edge_options)
    driver.maximize_window()
    return driver


def __setup_safari() -> webdriver:
    """Setup Safari web driver.

    Returns:A new local Safari driver.
    """
    capability = DesiredCapabilities.SAFARI
    capability[""] = {}
    driver = webdriver.Safari()
    driver.maximize_window()
    return driver


def __take_screenshot(web_driver: webdriver, test_name: str):
    """Generate screenshot of failure test.

    Args:
        web_driver: Current web driver.
        test_name: Name of the test function.
    """
    root_dir = os.path.dirname(os.path.abspath(__file__)).replace("tests", "reports")
    file_name = f"{str(datetime.datetime.now().timestamp())}_{test_name}.jpg"
    screenshot_file_path = os.path.join(root_dir, file_name)
    web_driver.save_screenshot(screenshot_file_path)
