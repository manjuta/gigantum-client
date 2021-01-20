import time

import requests

from gtmcore.logging import LMLogger
from gtmcore.container import ContainerOperations
from gtmcore.exceptions import GigantumException
from gtmcore.environment.componentmanager import ComponentManager

logger = LMLogger.get_logger()

DEFAULT_RSERVER_PORT = 8787


def start_rserver(project_container: ContainerOperations, check_reachable: bool = False) -> bool:
    """ Main entrypoint to launch rstudio-server. Note, the caller must
        determine for themselves the host and port.

        Raises an exception if there's a problem.

    Returns:
        Did we start a new rserver process?
    """
    if check_reachable:
        logger.warning('check_reachable for RStudio not currently supported')

    if project_container.query_container() != 'running':
        raise GigantumException(f"{str(project_container.labbook)} container is not running")

    rserver_ps = project_container.ps_search('rserver', reps=1)

    if len(rserver_ps) == 1:
        # we have an existing rstudio-server instance
        return False
    elif len(rserver_ps) == 0:
        _start_rserver_process(project_container)
        return True
    else:
        # "ps aux" for rserver returns multiple hits - this should never happen.
        for n, l in enumerate(rserver_ps):
            logger.error(f'Multiple RStudio-Server instances - ({n+1} of {len(rserver_ps)}) - {l}')
        raise ValueError(f'Multiple ({len(rserver_ps)}) RStudio Server instances detected')


def _start_rserver_process(project_container: ContainerOperations) -> None:
    cm = ComponentManager(labbook=project_container.labbook)
    revision = cm.base_fields["revision"]

    if revision <= 3:
        cmd = ("mkdir -p /home/giguser/.rstudio/monitored/user-settings"
               " && cp /tmp/user-settings /home/giguser/.rstudio/monitored/user-settings/"
               # --www-port is just here to be explicit / document how to change if needed
               " && exec /usr/lib/rstudio-server/bin/rserver --www-port=8787")
    else:
        cmd = "exec /usr/lib/rstudio-server/bin/rserver --www-port=8787"

    # USER skips the login screen for rserver, specifying `user` in exec_run is insufficient
    env = {'USER': 'giguser'}
    project_container.exec_command(cmd, environment=env, user='giguser')

    if not project_container.ps_search('rserver'):
        raise ValueError('RStudio (rserver) failed to start after 10 seconds')


def check_rstudio_reachable(test_url: str):
    for n in range(30):
        logger.debug(f"Attempt {n + 1}: Testing if Jupyter is up at {test_url}...")
        try:
            r = requests.head(test_url, timeout=0.5)
            # RStudio will return a temporary redirect if (as in this case) it doesn't support the browser
            if r.status_code != 302:
                time.sleep(0.5)
            else:
                logger.info(f'Found RStudio up at {test_url} after {n/2} seconds')
                break
        except requests.exceptions.ConnectionError:
            # Assume the proxies + RStudio aren't up at all yet, so no connection can be made
            time.sleep(0.5)
    else:
        raise GigantumException(f'Could not reach Jupyter at {test_url} after timeout')
