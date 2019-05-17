import graphene

from lmsrvlabbook.api.objects.secrets import SecretFileMapping


class SecretFileMappingConnection(graphene.relay.Connection):
    """Paging through a Project's SecretsVaults """
    class Meta:
        node = SecretFileMapping
