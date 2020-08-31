from dataclasses import dataclass
from framework.factory.models_enums.constants_enums import LocatorType


@dataclass
class PageConfig(object):
    """Model to store page parameters."""
    timeout = 15  # (Optional - Customise your explicit wait for every webElement)
    highlight = True  # (Optional - To highlight every webElement in PageClass)


@dataclass
class ComponentModel(PageConfig):
    """Model class to store UI element locator."""
    locator_type = LocatorType.XPath
    locator = None
