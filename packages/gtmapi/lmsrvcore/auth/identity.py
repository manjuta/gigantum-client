from flask import current_app
from gtmcore.auth.identity import AuthenticationError


def get_identity_manager_instance():
    """Method to retrieve the id manager from the flask application"""
    if "LABMGR_ID_MGR" not in current_app.config:
        raise AuthenticationError("Application mis-configured. Missing identity manager instance.", 401)

    return current_app.config["LABMGR_ID_MGR"]


def parse_token(auth_header: str) -> str:
    """Method to extract the bearer token from the authorization header

    Args:
        auth_header(str): The Authorization header

    Returns:
        str
    """
    if "Bearer" in auth_header:
        _, token = auth_header.split("Bearer ")
        if not token:
            raise AuthenticationError("Could not parse JWT from Authorization Header. Should be `Bearer XXX`", 401)
    else:
        raise AuthenticationError("Could not parse JWT from Authorization Header. Should be `Bearer XXX`", 401)

    return token
