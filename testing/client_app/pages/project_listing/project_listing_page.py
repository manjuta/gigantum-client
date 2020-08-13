from framework.base.page_base import BasePage
from framework.factory.models_enums.page_config import PageConfig
from framework.factory.models_enums.page_config import ComponentModel
from client_app.pages.project_listing.components.project_listing_component import ProjectListingComponent


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
        self._project_listing_component = None

    @property
    def project_listing_component(self) -> ProjectListingComponent:
        """Returns instance of project listing component."""
        if self._project_listing_component is None:
            self._project_listing_component = ProjectListingComponent(self.driver, self._project_listing_model)
        return self._project_listing_component
