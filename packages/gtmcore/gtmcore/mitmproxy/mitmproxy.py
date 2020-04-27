from typing import Optional, Tuple

from confhttpproxy import ProxyRouter

from gtmcore.container import ContainerOperations, SidecarContainerOperations
from gtmcore.logging import LMLogger
from gtmcore.exceptions import GigantumException

logger = LMLogger.get_logger()
# Current tag for gigantum/mitmproxy_proxy image
CURRENT_MITMPROXY_TAG = '2020-04-24'


class MITMProxyOperations(object):
    # This is baked into the MITM proxy docker image for the logfile directory
    # It is also used as the tag in sidecar container names
    namespace_key = 'mitmproxy'

    @classmethod
    def configure_mitmroute(cls, devtool_container: ContainerOperations, router: ProxyRouter,
                            new_rserver_session: bool,_retry: Optional[bool] = False) -> Tuple[str, str]:
        """Ensure mitm is configured and proxied for labbook

        Args:
            devtool_container: the specific target running a dev tool
            new_rserver_session: is this for a freshly-launched rserver?
            router: The link to the configurable-proxy-router wrapper
            _retry: (internal use only) is this a recursive call after clean-up?

        Returns:
            str that contains the mitm proxy endpoint as http://{ip}:{port}
        """
        if not devtool_container.image_tag:
            raise ValueError('Problem building image tag from username + project info')

        mitm_endpoint = cls.start_mitm_proxy(devtool_container, new_rserver_session)

        # Note that the use of rserver is not intrinsically meaningful - we could make this more generic
        # if mitmproxy supports multiple dev tools
        proxy_path = f'rserver/{devtool_container.image_tag}/'

        # existing route to MITM or not?
        matched_routes = router.get_matching_routes(mitm_endpoint, proxy_path)

        if len(matched_routes) == 1:
            suffix = matched_routes[0]
        elif len(matched_routes) == 0:
            logger.info('Creating route for existing RStudio mitmproxy_proxy')
            rt_prefix, _ = router.add(mitm_endpoint, proxy_path)
            # Warning: RStudio will break if there is a trailing slash!
            suffix = f'/{rt_prefix}'
        else:
            raise ValueError(
                f"Multiple routes to RStudio proxy for {str(devtool_container.labbook)}. Please restart Gigantum.")

        # The endpoint plus proxy target constitute the full URL for an MITM-reverse-proxied RStudio
        return f"{mitm_endpoint}/{proxy_path}", suffix

    @classmethod
    def get_mitmendpoint(cls, labbook_container: ContainerOperations) -> Optional[str]:
        """Determine in there is a proxy installed for this endpoint

        Args:
            labbook_container: the specific target running a dev tool

        Returns:
            str that contains the proxy endpoint as http://{ip}:{port}, None if not found
        """
        mitm_container = SidecarContainerOperations(labbook_container, cls.namespace_key)
        mitm_ip = mitm_container.query_container_ip()
        if mitm_ip:
            # This is the port for NGINX
            return f'http://{mitm_ip}:8079'
        else:
            return None

    @classmethod
    def get_mitmlogfile_path(cls, labbook_container: ContainerOperations) -> str:
        """Return the logfile path associated with the mitm proxy.

        Args:
            labbook_container: the specific target running a dev tool

        Returns:
        str that contains the logfile path
        """
        if not labbook_container.image_tag:
            raise ValueError("labbook_container must have an image_tag")

        return f'/mnt/share/{cls.namespace_key}/{labbook_container.image_tag}.rserver.dump'

    @classmethod
    def get_devtool_endpoint(cls, labbook_container: ContainerOperations) -> Optional[str]:
        """Return the dev tool container endpoint for the currently running mitm proxy.

        Args:
            labbook_container: the specific target running a dev tool

        Returns:
        str that contains the dev tool container endpoint
        """
        devtool_ip = labbook_container.query_container_ip()

        if devtool_ip:
            return f"http://{devtool_ip}:8787"
        else:
            return None

    @classmethod
    def get_proxy_devtool_target(cls, labbook_container: ContainerOperations) -> str:
        """Get the configured target for MITM from the container environment

        Args:
            labbook_container: the container running the devtool

        Returns:
            A string containing the configured target

        Raises:
            GigantumException if unable to identify the LBENDPOINT
        """
        mitm_container = SidecarContainerOperations(labbook_container, cls.namespace_key)
        lb_endpoint_in_list = [e for e in mitm_container.query_container_env()
                               if e.startswith('LBENDPOINT=')]

        if len(lb_endpoint_in_list) != 1:
            raise GigantumException('Unable to identify a unique LBENDPOINT from container environment')

        _, lb_endpoint = lb_endpoint_in_list[0].split('=', maxsplit=1)
        return lb_endpoint

    @classmethod
    def get_mitm_redis_key(cls, labbook_container: ContainerOperations):
        """Centralized convention for the hash key for an MITM proxy

        Args:
            labbook_container: the specific target running a dev tool

        Returns:
            str that contains the mitm hash key
        """
        return f"{cls.namespace_key}:{labbook_container.image_tag}"

    @classmethod
    def start_mitm_proxy(cls, primary_container: ContainerOperations, new_rserver_session: bool) -> str:
        """Launch a proxy container between client and labbook.

        Args:
            primary_container: the proxy target running a dev tool
            new_rserver_session: create a new mitmproxy, don't re-use

        Returns:
            str that contains the proxy endpoint as http://{ip}:{port}
        """
        devtool_endpoint = cls.get_devtool_endpoint(primary_container)
        if not devtool_endpoint:
            raise GigantumException("Can't get target URL for rserver")
        mitm_container = SidecarContainerOperations(primary_container, cls.namespace_key)
        container_status = mitm_container.query_container()

        if container_status == 'running' and not new_rserver_session:
            # Maybe we'll leave it running
            existing_mitm_endpoint = cls._check_running_proxy(mitm_container, devtool_endpoint)
            if existing_mitm_endpoint:
                return existing_mitm_endpoint

        # intentionally not an elif
        if container_status is not None:
            mitm_container.stop_container()

        # UID is obtained inside the container based on labmanager_share_vol (mounted at /mnt/share)
        env_var = [f"LBENDPOINT={devtool_endpoint}", f"LOGFILE_NAME={cls.get_mitmlogfile_path(primary_container)}"]
        volumes_dict = {
            'labmanager_share_vol': {'bind': '/mnt/share', 'mode': 'rw'}
        }

        mitm_ip = mitm_container.run_container("gigantum/mitmproxy_proxy:" + CURRENT_MITMPROXY_TAG,
                                               volumes=volumes_dict, environment=env_var)

        if not mitm_ip:
            raise GigantumException("Unable to get mitmproxy_proxy IP address.")

        # This is the port for NGINX
        mitm_endpoint = f'http://{mitm_ip}:8079'

        if not mitm_container.ps_search('nginx'):
            raise GigantumException('mitmproxy failed to start after 10 seconds')

        return mitm_endpoint

    @classmethod
    def _check_running_proxy(cls, mitm_container: SidecarContainerOperations, devtool_endpoint: str) -> Optional[str]:
        """Check a running MITM proxy and stop it if it's not set up right

        Args:
            mitm_container: We'll also use this to get the primary_container
            devtool_endpoint: we'll use this to check our configuration

        Returns:
            The endpoint target for this MITM proxy, otherwise None
        """
        try:
            configured_devtool_endpoint = cls.get_proxy_devtool_target(mitm_container.primary_container)
        except GigantumException:
            return None

        if configured_devtool_endpoint == devtool_endpoint and mitm_container.ps_search('nginx', 1):
            # It looks good!
            return cls.get_mitmendpoint(mitm_container.primary_container)

        return None

    @classmethod
    def stop_mitm_proxy(cls, primary_container: ContainerOperations) -> bool:
        """Stop the MITM proxy. Destroy container.

        Args:
            primary_container: the proxy target running a dev tool

        Returns:
            Did we stop a container? If not, probably it didn't exist.
        """
        mitm_container = SidecarContainerOperations(primary_container, cls.namespace_key)
        return mitm_container.stop_container()
