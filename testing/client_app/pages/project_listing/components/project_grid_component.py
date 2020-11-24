from framework.base.component_base import BaseComponent
from selenium import webdriver
from framework.factory.models_enums.page_config import ComponentModel


class ProjectGridComponent(BaseComponent):
    """ Represents one of the components while viewing the project lists .

    Holds a set of all locators within grid for each project as an entity. Helps in iterating through the
    project details in the grid Handles events and test functions of locators
    """

    def __init__(self, driver: webdriver, component_data: ComponentModel) -> None:
        super(ProjectGridComponent, self).__init__(driver, component_data)

    def get_project_title_by_index(self, position: int) -> str:
        sel_project = self.ui_element.find_element_by_xpath(f"a[{str(position)}]")
        proj_name = sel_project.find_element_by_xpath("div[2]//div[1]//h5[1]//div[1]")
        print(proj_name.get_text())
        return proj_name.get_text()
