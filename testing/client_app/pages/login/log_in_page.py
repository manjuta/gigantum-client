from framework.base.page_base import BasePage
from framework.factory.models_enums.page_config import PageConfig
from framework.factory.models_enums.page_config import ComponentModel
from client_app.pages.login.components.log_in_component import LogInComponent
from client_app.pages.login.components.sign_up_component import SignUpComponent
from client_app.pages.project_listing.project_listing_page import ProjectListingPage


class LogInPage(BasePage):
    """Represents the login page of gigantum client.

    Holds the locators on the login page of gigantum client. The locators can be
    presented in its corresponding component or directly on the page. Test functions can
    use these objects for all activities and validations and can avoid those in the
    test functions.
    """

    def __init__(self, driver) -> None:
        page_config = PageConfig()
        super(LogInPage, self).__init__(driver, page_config)
        self._log_in_component_model = ComponentModel()
        self._sign_up_component_model = ComponentModel()
        self._sign_up_component = None
        self._log_in_component = None

    @property
    def sign_up_component(self) -> SignUpComponent:
        """Sign-up component."""
        if self._sign_up_component is None:
            self._sign_up_component = SignUpComponent(self.driver, self._sign_up_component_model)
        return self._sign_up_component

    @property
    def log_in_component(self) -> LogInComponent:
        """Log-in component."""
        if self._log_in_component is None:
            self._log_in_component = LogInComponent(self.driver, self._log_in_component_model)
        return self._log_in_component

    def login(self, user_name: str, password: str) -> ProjectListingPage:
        """Performs log-in functionality.

        Args:
            user_name:
                Name of the user who wants to login to the application.
            password:
                Password assigned for the current user.

        Returns:
            Instance of project list page.
        """
        self.log_in_component.login(user_name, password)
        return ProjectListingPage(self.driver)
