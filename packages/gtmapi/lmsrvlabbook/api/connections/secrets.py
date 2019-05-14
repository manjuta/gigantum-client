import graphene

from lmsrvlabbook.api.objects.secrets import SecretsVault


class SecretsVaultConnection(graphene.relay.Connection):
    """Paging through a Project's SecretsVaults """
    class Meta:
        node = SecretsVault
