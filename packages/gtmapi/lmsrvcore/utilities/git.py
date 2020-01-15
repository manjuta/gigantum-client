from typing import Optional
import flask
from gtmcore.workflows.gitlab import GitLabManager
from lmsrvcore.auth.user import get_logged_in_username


def configure_git_credentials(remote_name: Optional[str] = None) -> GitLabManager:
    """Helper method to initialize the logged in user's git credentials

    Args:
        remote_name: Name of the remote to lookup, if omitted uses the default remote

    Returns:

    """
    # Get remote server configuration
    config = flask.current_app.config['LABMGR_CONFIG']
    remote_config = config.get_remote_configuration(remote_name)

    # Extract valid Bearer and ID tokens
    access_token = flask.g.get('access_token', None)
    id_token = flask.g.get('id_token', None)
    if not access_token or not id_token:
        raise ValueError("A valid session is required for this operation and tokens are missing.")

    mgr = GitLabManager(remote_config['git_remote'],
                        remote_config['hub_api'],
                        access_token=access_token,
                        id_token=id_token)
    mgr.configure_git_credentials(remote_config['git_remote'], get_logged_in_username())

    return mgr
