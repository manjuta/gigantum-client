import graphene

from gtmcore.labbook import SecretStore, LabBook
from gtmcore.inventory.inventory import InventoryManager
from gtmcore.logging import LMLogger

from lmsrvcore.auth.user import get_logged_in_username, get_logged_in_author
from lmsrvlabbook.api.objects.environment import Environment
from lmsrvcore.api.mutations import ChunkUploadMutation, ChunkUploadInput

logger = LMLogger.get_logger()


class InsertSecretsEntry(graphene.relay.ClientIDMutation):
    class Input:
        owner = graphene.String(required=True)
        labbook_name = graphene.String(required=True)
        filename = graphene.String(required=True)
        mount_path = graphene.String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, owner, filename, mount_path, client_mutation_id=None):
        return InsertSecretsEntry(None)


class RemoveSecretsEntry(graphene.relay.ClientIDMutation):
    class Input:
        owner = graphene.String(required=True)
        labbook_name = graphene.String(required=True)
        filename = graphene.String(required=True)
        mount_path = graphene.String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, owner, filename, mount_path, client_mutation_id=None):
        return RemoveSecretsEntry(None)

class UploadSecretsFile(graphene.relay.ClientIDMutation, ChunkUploadMutation):
    class Input:
        owner = graphene.String(required=True)
        labbook_name = graphene.String(required=True)
        mount_path = graphene.String(required=True)
        chunk_upload_params = ChunkUploadInput(required=True)
        transaction_id = graphene.String(required=True)

    environment = graphene.Field(lambda: Environment)

    @classmethod
    def mutate_and_wait_for_chunks(cls, info, **kwargs):
        return UploadSecretsFile(environment=None)

    @classmethod
    def mutate_and_process_upload(cls, info, upload_file_path, upload_filename, **kwargs):
        if not upload_file_path:
            logger.error('No file uploaded')
            raise ValueError('No file uploaded')

        username = get_logged_in_username()
        owner = kwargs.get('owner')
        labbook_name = kwargs.get('labbook_name')
        mount_path = kwargs.get('mount_path')

        lb = InventoryManager().load_labbook(username, owner, labbook_name)
        with lb.lock():
            secret_store = SecretStore(lb, username)
            inserted_path = secret_store.insert_file(upload_file_path,
                                                     dst_filename=upload_filename)

        return UploadSecretsFile(environment=Environment(owner=owner,
                                                         name=labbook_name))


class DeleteSecretsFile(graphene.ClientIDMutation):
    class Input:
        owner = graphene.String(required=True)
        labbook_name = graphene.String(required=True)
        key_filename = graphene.String(required=True)

    environment = graphene.Field(lambda: Environment)

    @classmethod
    def mutate_and_get_payload(cls, root, info, owner, labbook_name, key_filename, client_mutation_id=None):
        username = get_logged_in_username()
        lb = InventoryManager().load_labbook(username, owner, labbook_name,
                                             author=get_logged_in_author())
        with lb.lock():
            secstore = SecretStore(lb, username)
            secstore.delete_file(key_filename)

        return DeleteSecretsFile(environment=Environment(owner=owner,
                                                         name=lb.name))
