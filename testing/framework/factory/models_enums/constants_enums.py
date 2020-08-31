import enum

"""Declare all enumerations used in framework."""

class LocatorType(enum.Enum):
    """All locator types to identify UI element."""
    CSS = 'css'
    Id = 'id'
    Name = 'name'
    XPath = 'xpath'
    LinkText = 'link_text'
    PartialLinkText = 'partial_link_text'
    Tag = 'tag'
    ClassName = 'class_name'


class LoginUser(enum.Enum):
    """Available user types to retrieve user credentials."""
    User1 = 'User1'
    User2 = 'User2'
    User3 = 'User3'
    User4 = 'User4'
    User5 = 'User5'
    User6 = 'User6'
    User7 = 'User7'
    User8 = 'User8'


class CompareUtilityType(enum.Enum):
    """Indicates the compare function type."""
    CompareText = 'compare_text'
