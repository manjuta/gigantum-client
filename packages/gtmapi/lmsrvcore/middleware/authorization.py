import flask
from lmsrvcore.auth.identity import get_identity_manager_instance, AuthenticationError, tokens_from_headers
from gtmcore.logging import LMLogger
from gtmcore.configuration import Configuration

logger = LMLogger.get_logger()


class AuthorizationMiddleware(object):
    """Middleware to enforce authentication requirements, parse JWTs, and switch server configuration.

    Note: info.context.is_authenticated attribute is used to ensure that an attempt to validate tokens
    is only run once per request. If this attribute exists in info.context, the parsing and validation code is skipped.

    """
    identity_mgr = None

    def resolve(self, next, root, info, **args):
        if not self.identity_mgr:
            self.identity_mgr = get_identity_manager_instance()

        # If the `is_authenticated` field does not exist in the request context, process the headers
        if not hasattr(info.context, "is_authenticated"):
            # Change the server configuration if requested
            if "GTM-SERVER-ID" in info.context.headers:
                logger.info(f"Processing change server request for server id: {info.context.headers['GTM-SERVER-ID']}")
                config: Configuration = flask.current_app.config['LABMGR_CONFIG']
                current_config = config.get_server_configuration()
                try:
                    config.set_current_server(info.context.headers['GTM-SERVER-ID'])
                except Exception as err:
                    logger.exception(f"Failed to switch server configuration to server id"
                                     f" `{info.context.headers['GTM-SERVER-ID']}`")
                    # Roll back to previous server configuration
                    config.set_current_server(current_config.id)
                    logger.warning(f"Successfully rolled back server id to `{current_config.id}`")

            # Parse tokens
            access_token, id_token = tokens_from_headers(info.context.headers)

            # Save token to the request context for future use (e.g. look up a user's profile information if needed)
            flask.g.access_token = access_token
            flask.g.id_token = id_token

            # Check if you are authenticated, raising an AuthenticationError if you are not.
            if self.identity_mgr.is_authenticated(access_token, id_token):
                # We store the result of token validation in the request context so all resolvers don't need to
                # repeat this process for no reason.
                info.context.is_authenticated = True
            else:
                info.context.is_authenticated = False
                raise AuthenticationError("User not authenticated", 401)

        if info.context.is_authenticated is False:
            raise AuthenticationError("User not authenticated", 401)

        return next(root, info, **args)
