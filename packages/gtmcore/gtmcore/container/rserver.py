from typing import Optional

from gtmcore.logging import LMLogger
from gtmcore.container import container_for_context, ContainerOperations
from gtmcore.labbook import LabBook
from gtmcore.exceptions import GigantumException

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

    proj_container = container_for_context(username, labbook=labbook, override_image_name=tag)
    if proj_container.query_container() != 'running':
        raise GigantumException(f"{str(labbook)} container is not running")

    rserver_ps = proj_container.ps_search('rserver', reps=1)

    if len(rserver_ps) == 1:
        # we have an existing rstudio-server instance
        return
    elif len(rserver_ps) == 0:
        _start_rserver_process(proj_container)
    else:
        # "ps aux" for rserver returns multiple hits - this should never happen.
        for n, l in enumerate(rserver_ps):
            logger.error(f'Multiple RStudio-Server instances - ({n+1} of {len(rserver_ps)}) - {l}')
        raise ValueError(f'Multiple ({len(rserver_ps)}) RStudio Server instances detected')


def _start_rserver_process(project_container: ContainerOperations) -> None:
    # This custom PYTHONPATH is also specified in the neighboring jupyter.py file.
    # It would be good we standardize this somehow at a general dev_tool level, perhaps in #453?
    # Python should be supported in the R container.
    cmd = ("mkdir -p /home/giguser/.rstudio/monitored/user-settings"
           " && cp /tmp/user-settings /home/giguser/.rstudio/monitored/user-settings/"
           # --www-port is just here to be explicit / document how to change if needed
           " && exec /usr/lib/rstudio-server/bin/rserver --www-port=8787")
    # USER skips the login screen for rserver, specifying `user` in exec_run is insufficient
    env = {'USER': 'giguser'}
    project_container.exec_command(cmd, environment=env, user='giguser')

    if not project_container.ps_search('rserver'):
        raise ValueError('RStudio (rserver) failed to start after 10 seconds')
