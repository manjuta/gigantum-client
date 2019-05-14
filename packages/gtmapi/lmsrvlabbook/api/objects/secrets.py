import graphene

from gtmcore.labbook import SecretStore
from gtmcore.logging import LMLogger

from lmsrvcore.api.interfaces import GitRepository
from lmsrvcore.auth.user import get_logged_in_username

logger = LMLogger.get_logger()


class SecretsVault(graphene.ObjectType, interfaces=(graphene.relay.Node, GitRepository)):
    """Represents a secret vault - i.e., a directory that contains secret key files. """

    # Name of the vault
    vault_name = graphene.String()

    # A list of file names stored within this "vault"
    secrets_files = graphene.List(graphene.String)

    # Path *inside the running project container*
    mount_path = graphene.String()

    @classmethod
    def get_node(cls, info, id):
        """Method to resolve the object based on its Node ID"""
        # Parse the key
        owner, name, vault_name = id.split("&")

        return SecretsVault(id=f"{owner}&{name}&{vault_name}",
                            name=name, owner=owner, vault_name=vault_name)

    def resolve_id(self, info):
        """Resolve the unique Node id for this object"""
        if not self.owner or not self.name:
            raise ValueError("Resolving a Environment Node ID requires owner and name to be set")

        return f"{self.owner}&{self.name}&{self.vault_name}"

    def _helper_resolve_secrets_file(self, labbook):
        secret_store = SecretStore(labbook, get_logged_in_username())
        return secret_store.list_files(self.vault_name)

    def resolve_secrets_files(self, info):
        return info.context.labbook_loader.load(f"{get_logged_in_username()}&{self.owner}&{self.name}").then(
            lambda labbook: self._helper_resolve_secrets_file(labbook))

    def _helper_resolve_mount_path(self, labbook):
        secret_store = SecretStore(labbook, get_logged_in_username())
        return secret_store[self.vault_name]

    def resolve_mount_path(self, info):
        return info.context.labbook_loader.load(f"{get_logged_in_username()}&{self.owner}&{self.name}").then(
            lambda labbook: self._helper_resolve_mount_path(labbook))
