import enum

"""Declare all enumerations used in client app."""


class GigantumConstants(enum.Enum):
    """All constants for client app."""
    PROJECTS_FOLDER = 'labbooks'
    SERVERS_FOLDER = 'servers'
    DEFAULT_FILE_NAME = 'requirements.txt'
    HOME_DIRECTORY = '~/gigantum'
    UNTRACKED_FOLDER = 'untracked'

