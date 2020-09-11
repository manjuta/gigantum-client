from framework.base.page_base import BasePage
from framework.factory.models_enums.page_config import PageConfig
from client_app.pages.landing.components.landing_component import LandingComponent
from framework.factory.models_enums.page_config import ComponentModel


class LandingPage(BasePage):
    """Represents the landing page of gigantum client.

    Holds the locators on the landing page of gigantum client. The locators can be
    presented in its corresponding component or directly on the page. Test functions can
    use these objects for all activities and validations and can avoid those in the
    test functions.
    """

    def __init__(self, driver, can_use_config_url: bool = True) -> None:
        page_config = PageConfig()
        super(LandingPage, self).__init__(driver, page_config, can_use_config_url)
        self.component_model = ComponentModel()
        self._landingPageComponent = None

    @property
    def landing_component(self) -> LandingComponent:
        """ Returns an instance of landing component."""
        if self._landingPageComponent is None:
            self._landingPageComponent = LandingComponent(self.driver, self.component_model)

        return self._landingPageComponent
