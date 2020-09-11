from dataclasses import dataclass


@dataclass
class UserCredentials(object):
    """Model class to store user credentials."""
    user_name: str
    password: str
