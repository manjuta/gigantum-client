from typing import Optional

from gtmcore.container import container_for_context
from gtmcore.labbook import LabBook
from gtmcore.exceptions import GigantumException


def start_bundled_app(labbook: LabBook, username: str, command: str, tag: Optional[str] = None) -> None:
    """ Method to start a bundled app by running the user specified command inside the running Project container

    Args:
        labbook: labbook instance
        username: current logged in user
        command: user specified command to run
        tag: optional tag for the container override id

    Returns:

    """
    if len(command) == 0:
        return

    proj_container = container_for_context(username, labbook=labbook)

    if proj_container.query_container() != 'running':
        raise GigantumException(f"{str(labbook)} container is not running. Start it before starting a bundled app.")

    proj_container.exec_command(command, user='giguser')
