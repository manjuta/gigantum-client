import graphene


class ServerAuthTypeSpecificField(graphene.ObjectType):
    """A type representing a server's auth configuration (typically the currently selected server)
    """
    class Meta:
        interfaces = (graphene.relay.Node,)

    server_id = graphene.String(required=True)
    parameter = graphene.String(required=True)
    value = graphene.String(required=True)

    @classmethod
    def get_node(cls, info, id):
        """Method to resolve the object based on it's Node ID"""
        raise ValueError("ServerAuthTypeSpecificField type does not support fetching by ID.")

    def resolve_id(self, info):
        """Resolve the unique Node id for this object"""
        if not self.id:
            self.id = f"{self.server_id}&{self.parameter}"

        return self.id


class ServerAuth(graphene.ObjectType):
    """A type representing a server's auth configuration (typically the currently selected server)
    """
    class Meta:
        interfaces = (graphene.relay.Node,)

    server_id = graphene.String(required=True)
    login_type = graphene.String()
    login_url = graphene.String()
    audience = graphene.String()
    issuer = graphene.String()
    signing_algorithm = graphene.String()
    public_key_url = graphene.String()
    type_specific_fields = graphene.List(ServerAuthTypeSpecificField)

    @classmethod
    def get_node(cls, info, id):
        """Method to resolve the object based on it's Node ID"""
        raise ValueError("ServerAuth type does not support fetching by ID.")

    def resolve_id(self, info):
        """Resolve the unique Node id for this object"""
        if not self.id:
            if not self.server_id:
                raise ValueError("Resolving a Server Auth Node ID requires the `server_id` to be set")

            self.id = self.server_id

        return self.id

