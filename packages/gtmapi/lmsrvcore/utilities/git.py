from typing import Optional
import flask
from gtmcore.workflows.gitlab import GitLabManager
from lmsrvcore.auth.user import get_logged_in_username
from lmsrvcore.auth.identity import tokens_from_request_context


def configure_git_credentials() -> GitLabManager:
    """Helper method to initialize the logged in user's git credentials

    Returns:
        GitLabManager
    """
    # Get remote server configuration
    server_config = flask.current_app.config['LABMGR_CONFIG'].get_server_configuration()

    # Get tokens from request context
    access_token, id_token = tokens_from_request_context(tokens_required=True)

    mgr = GitLabManager(server_config.git_url,
                        server_config.hub_api_url,
                        access_token=access_token,
                        id_token=id_token)
    mgr.configure_git_credentials(server_config.git_url, get_logged_in_username())

    return mgr


def remove_git_credentials() -> None:
    """Helper method to remove the logged in user's git credentials, if they have been cached

    Returns:
        None
    """
    # Get remote server configuration
    config = flask.current_app.config['LABMGR_CONFIG']
    server_config = config.get_server_configuration()

    # Get tokens from request context
    access_token, id_token = tokens_from_request_context(tokens_required=True)

    mgr = GitLabManager(server_config.git_url,
                        server_config.hub_api_url,
                        access_token=access_token,
                        id_token=id_token)
    mgr.clear_git_credentials(server_config.git_url, get_logged_in_username())
