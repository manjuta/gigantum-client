import graphene
import flask

from lmsrvlabbook.api.objects.serverauth import ServerAuth


class Server(graphene.ObjectType):
    """A type representing a server's configuration (typically the currently selected server)
    """
    class Meta:
        interfaces = (graphene.relay.Node,)

    server_id = graphene.String(required=True)
    name = graphene.String()
    base_url = graphene.String()
    git_url = graphene.String()
    git_server_type = graphene.String()
    hub_api_url = graphene.String()
    object_service_url = graphene.String()
    user_search_url = graphene.String()
    lfs_enabled = graphene.Boolean()
    auth_config = graphene.Field(ServerAuth)
    backup_in_progress = graphene.Boolean()

    @classmethod
    def get_node(cls, info, id):
        """Method to resolve the object based on it's Node ID"""
        raise ValueError("Server type does not support fetching by ID.")

    def resolve_id(self, info):
        """Resolve the unique Node id for this object"""
        if not self.id:
            if not self.server_id:
                raise ValueError("Resolving a Server Node ID requires the server name to be set")

            self.id = self.server_id

        return self.id


def helper_get_current_server():
    server_config = flask.current_app.config['LABMGR_CONFIG'].get_server_configuration()
    auth_config = flask.current_app.config['LABMGR_CONFIG'].get_auth_configuration()

    if auth_config.login_type == "auth0":
        type_specific_fields = []
    elif auth_config.login_type == "internal":
        type_specific_fields = []
    else:
        raise ValueError(f"Unsupported authentication system type: {auth_config.login_type}")

    server_auth = ServerAuth(server_id=server_config.id,
                             login_type=auth_config.login_type,
                             login_url=auth_config.login_url,
                             logout_url=auth_config.logout_url,
                             token_url=auth_config.token_url,
                             audience=auth_config.audience,
                             issuer=auth_config.issuer,
                             client_id=auth_config.client_id,
                             signing_algorithm=auth_config.signing_algorithm,
                             public_key_url=auth_config.public_key_url,
                             type_specific_fields=type_specific_fields)

    try:
        gitlab_response = requests.get(f"{server_config.git_url}/backup")
        if gitlab_response.status_code == 503 and "backup in progress" in str(response.content).lower():
            backup_in_progress = True
        else:
            backup_in_progress = False
    except requests.exceptions.SSLError:
        backup_in_progress = False

    return Server(server_id=server_config.id,
                  name=server_config.name,
                  base_url=server_config.base_url,
                  git_url=server_config.git_url,
                  git_server_type=server_config.git_server_type,
                  hub_api_url=server_config.hub_api_url,
                  object_service_url=server_config.object_service_url,
                  user_search_url=server_config.user_search_url,
                  lfs_enabled=server_config.lfs_enabled,
                  auth_config=server_auth,
                  backup_in_progress=backup_in_progress)
