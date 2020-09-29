from dataclasses import dataclass
from framework.factory.models_enums.constants_enums import LocatorType

@dataclass
class PageConfig(object):
    """Model to store page parameters."""
    timeout: int = 15  # (Optional - Customise your explicit wait for every webElement)
    highlight: bool = True  # (Optional - To highlight every webElement in PageClass)

@dataclass
class ComponentModel(PageConfig):
    """Model class to store UI element locator."""
    locator_type: LocatorType = LocatorType.XPath
    locator: str = None