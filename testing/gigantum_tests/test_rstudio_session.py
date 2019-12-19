import logging
import time

import selenium
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

import testutils
from testutils.elements import ProjectControlElements, RStudioElements, ActivityElements


import_tidyverse_snippet = """```{r}
library(tidyverse)
```
"""

ggplot_snippet = """```{r}
ggplot(mtcars, aes(x=wt, y=mpg)) +
  ggtitle('Dot-plot of mpg on wt') +
  geom_point()
```
"""

def test_rstudio_session(driver: selenium.webdriver, *args, **kwargs):
    """
    Test the creation of a basic RStudio session.

    Args:
        driver
    """
    r = testutils.prep_rstudio_base(driver)
    project_elements = ProjectControlElements(driver)
    project_elements.container_status_stopped.wait_to_appear(200)

    logging.info("Opening RStudio")
    project_elements.launch_devtool("RStudio")
    rstudio_elements = RStudioElements(driver)
    rstudio_elements.some_selected_tab.wait_to_appear(20)

    assert rstudio_elements.selected_files_tab.selector_exists()

    logging.info("Using R console")
    time.sleep(30)
    ActionChains(driver).send_keys("with(mtcars, {plot(wt, mpg); abline(lm(mpg~wt))})\n"
                                   "title('Regression of MPG on Weight')\n").perform()
    ActionChains(driver).send_keys("with(mtcars, {plot(wt, mpg); abline(lm(mpg~wt))})\n"
                                   "title('Regression of MPG on Weight')\n").perform()
    time.sleep(30)

    logging.info("Checking for active plot")
    # Now the plots tab should be active...
    assert rstudio_elements.selected_plots_tab.selector_exists()
    # ...and the files tab should not
    assert not rstudio_elements.selected_files_tab.selector_exists()

    logging.info("Checking activity record")
    project_elements.open_gigantum_client_tab()
    activity_elements = ActivityElements(driver)
    activity_elements.link_activity_tab.wait_to_appear().click()
    time.sleep(3)

    assert "Executed in console and generated a result" in activity_elements.first_card_label.find().text, \
        f"Expected 'Executed in console and generated a result' in first card label, but instead found " \
        f"{activity_elements.first_card_label.find().text}"
    # Note - this could be from ANY card, not just the first
    # Dav couldn't figure out how to do searching from within an element
    assert activity_elements.first_card_img.selector_exists()

    logging.info("Creating R notebook")
    project_elements.open_devtool_tab("RStudio")
    rstudio_elements.new_notebook()
    time.sleep(3)

    logging.info("Importing tidyverse in R notebook")
    # At this point, we should be in the metadata section of a new R(md) Notebook
    actions = ActionChains(driver).send_keys(Keys.ARROW_DOWN, Keys.ARROW_DOWN) \
        .send_keys(import_tidyverse_snippet) \
        .send_keys(Keys.ARROW_UP)
    # There's probably some more paradigmatic way to do this, but this should work fine enough for now
    rstudio_elements.ctrl_shift_enter(actions)
    time.sleep(3)

    logging.info("Creating a ggplot graph in R notebook")
    actions = ActionChains(driver).send_keys(Keys.ARROW_DOWN) \
        .send_keys(ggplot_snippet) \
        .send_keys(Keys.ARROW_UP)
    rstudio_elements.ctrl_shift_enter(actions)
    time.sleep(3)

    logging.info("Checking updated activity record")
    project_elements.open_gigantum_client_tab()

    # TODO for issue #55 check that a new activity record is created with the proper graphic
