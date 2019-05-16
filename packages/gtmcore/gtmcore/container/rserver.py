import time
from typing import Optional

from docker.models.containers import Container

from gtmcore.inventory.inventory import InventoryManager
from gtmcore.logging import LMLogger
from gtmcore.configuration import get_docker_client
from gtmcore.container.utils import infer_docker_image_name, ps_search
from gtmcore.labbook import LabBook
from gtmcore.exceptions import GigantumException
from gtmcore.container.jupyter import PYTHON_ENV_CMD

logger = LMLogger.get_logger()

DEFAULT_RSERVER_PORT = 8787


def start_rserver(labbook: LabBook, username: str, tag: Optional[str] = None, check_reachable: bool = False) -> None:
    """ Main entrypoint to launch rstudio-server. Note, the caller must
        determine for themselves the host and port.

        Raises an exception if there's a problem.

    Returns:
        Path to rstudio-server 
    """
    if check_reachable:
        logger.warning('check_reachable for RStudio not currently supported')

    owner = InventoryManager().query_owner(labbook)
    lb_key = tag or infer_docker_image_name(labbook_name=labbook.name,
                                            owner=owner,
                                            username=username)
    docker_client = get_docker_client()
    lb_container = docker_client.containers.get(lb_key)
    if lb_container.status != 'running':
        raise GigantumException(f"{str(labbook)} container is not running")

    rserver_ps = ps_search(lb_container, 'rserver')

    if len(rserver_ps) == 1:
        # we have an existing rstudio-server instance
        return
    elif len(rserver_ps) == 0:
        _start_rserver_process(lb_container)
    else:
        # If "ps aux" for rserver returns multiple hits - this should never happen.
        for n, l in enumerate(rserver_ps):
            logger.error(f'Multiple RStudio-Server instances - ({n+1} of {len(rserver_ps)}) - {l}')
        raise ValueError(f'Multiple ({len(rserver_ps)}) RStudio Server instances detected')


def _start_rserver_process(lb_container: Container) -> None:
    # This custom PYTHONPATH is also specified in the neighboring jupyter.py file.
    # It would be good we standardize this somehow at a general dev_tool level, perhaps in #453?
    # Python should be supported in the R container.
    cmd = (PYTHON_ENV_CMD +
           " && mkdir -p /home/giguser/.rstudio/monitored/user-settings"
           " && cp /tmp/user-settings /home/giguser/.rstudio/monitored/user-settings/"
           # --www-port is just here to be explicit / document how to change if needed
           " && exec /usr/lib/rstudio-server/bin/rserver --www-port=8787")
    # USER skips the login screen for rserver, specifying `user` in exec_run is insufficient
    env = {'USER': 'giguser'}
    lb_container.exec_run(f'sh -c "{cmd}"', detach=True, user='giguser', environment=env)

    # Pause briefly to avoid race conditions
    for timeout in range(10):
        time.sleep(1)

        if ps_search(lb_container, 'rserver'):
            logger.info(f"RStudio (rserver) started within {timeout + 1} seconds")
            break
    else:
        raise ValueError('RStudio (rserver) failed to start after 10 seconds')
