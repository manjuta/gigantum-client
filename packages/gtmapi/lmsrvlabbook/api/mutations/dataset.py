import graphene
import base64
import os
import flask

import gtmcore.dispatcher.dataset_jobs
from gtmcore.inventory.inventory import InventoryManager, InventoryException
from gtmcore.logging import LMLogger
from gtmcore.workflows.gitlab import GitLabManager
from gtmcore.exceptions import GigantumException

from lmsrvcore.auth.user import get_logged_in_username, get_logged_in_author
from lmsrvcore.utilities import configure_git_credentials
from gtmcore.activity import ActivityStore, ActivityType, ActivityDetailType, ActivityRecord, ActivityDetailRecord
from gtmcore.activity.utils import TextData, DetailRecordList, ImmutableList


from lmsrvlabbook.api.objects.dataset import Dataset
from gtmcore.dataset.manifest import Manifest
from gtmcore.dispatcher import Dispatcher, jobs

from gtmcore.dataset.storage import GigantumObjectStore
# Avoid name conflict with the Dataset API imported above
from gtmcore.dataset import Dataset as DatasetObj


from lmsrvlabbook.api.connections.dataset import DatasetConnection
from lmsrvlabbook.api.objects.dataset import DatasetConfigurationParameterInput
from lmsrvlabbook.api.connections.labbook import Labbook, LabbookConnection
from lmsrvcore.auth.identity import tokens_from_request_context


logger = LMLogger.get_logger()


class ConfigureDatasetBackend(graphene.relay.ClientIDMutation):
    """Mutation to configure a dataset backend if needed.

    TODO DJWC - I renamed this endpoint intentionally to ensure we revisit this in the front end. It's not clear this is
     necessary at all for gigantum datasets. Maybe remove entirely? Code that may be useful for Externally Managed
     Datasets should be retained. Should also be made generic but in a much simpler way than the current configuration
     publishing mechanism.

     The idea now is to configure the backend, and THEN pass that configuration into the Dataset Creation (directly
     above). I'm not actually sure if this needs to be a mutation on the back-end. In terms of the client app, this
     would correspond to the first screen after clicking "new dataset" where the user selects the backend using
     something like the base-image selection tool.

    """

    class Input:
        dataset_owner = graphene.String(required=True, description="Owner of the dataset to configure")
        dataset_name = graphene.String(required=True, description="Name of the dataset to configure")
        parameters = graphene.List(DatasetConfigurationParameterInput)
        reset_parameters = graphene.Boolean(description="Set to true to clear the configuration to start over")

    dataset = graphene.Field(Dataset)
    is_configured = graphene.Boolean(description="If true, all parameters a set and OK to continue")
    should_confirm = graphene.Boolean(description="If true, should confirm configuration with the user "
                                                  "and resubmit with confirm=True to finalize")
    error_message = graphene.String(description="Configuration error message to display to the user")
    confirm_message = graphene.String(description="Confirmation message to display to the user")
    has_background_job = graphene.Boolean(description="If true, this backend type requires background work"
                                                      " after confirmation. Check complete_background_key for key to "
                                                      "provide user feedback.")
    background_job_key = graphene.String(description="Background job key to query on for feedback if needed")

    @classmethod
    def mutate_and_get_payload(cls, root, info, dataset_owner, dataset_name, parameters=None, reset_parameters=False,
                               client_mutation_id=None):
        logged_in_username = get_logged_in_username()
        im = InventoryManager()
        ds = im.load_dataset(logged_in_username, dataset_owner, dataset_name, get_logged_in_author())
        backend = ds.backend

        if reset_parameters:
            current_config = ds.backend_config
            # TODO DJWC - do we clear credentials here?
            # Need to delete to make .has_credentials() work, could make into a method
            del current_config['credentials']
            for param in parameters:
                # TODO DJWC - and why not `del` here?
                current_config[param.parameter] = None
            ds.backend_config = current_config

            if parameters is not None:
                # Update the configuration
                current_config = ds.backend_config
                for param in parameters:
                    current_config[param.parameter] = param.value
                ds.backend_config = current_config

        # TODO DJWC - This needs to get changed to a backend instead of a full dataset
        return ConfigureDatasetBackend(dataset=Dataset(id="{}&{}".format(dataset_owner, dataset_name),
                                                       name=dataset_name, owner=dataset_owner),
                                       # TODO DJWC - keeping all params in for now to avoid breaking API too much
                                       # We don't check, so None instead of False
                                       is_configured=None,
                                       # Should be true for external datasets, and maybe local, but is never true for now
                                       should_confirm=False,
                                       confirm_message=None,
                                       error_message=None,
                                       has_background_job=False,
                                       background_job_key=None)


class CreateDataset(graphene.relay.ClientIDMutation):
    """Mutation for creation of a new Dataset on disk

    TODO DJWC - Workflow to create a dataset:
    - Click "new dataset"
    - Backend selection modal -> backend configuration parameters
    - Backend configuration is passed to the
    """

    class Input:
        name = graphene.String(required=True)
        description = graphene.String(required=True)
        # storage_type = graphene.String(required=True)
        backend_configuration = graphene.Field(ConfigureDatasetBackend)

    # Return the dataset instance
    dataset = graphene.Field(Dataset)

    @classmethod
    def mutate_and_get_payload(cls, root, info, name, description, storage_type, client_mutation_id=None):
        username = get_logged_in_username()
        inv_manager = InventoryManager()

        inv_manager.create_dataset(username=username,
                                   owner=username,
                                   dataset_name=name,
                                   description=description,
                                   storage_type=storage_type,
                                   author=get_logged_in_author())

        return CreateDataset(dataset=Dataset(id="{}&{}".format(username, name),
                                             name=name, owner=username))


class UpdateLocalDataset(graphene.relay.ClientIDMutation):
    """Mutation to update the manifest for a local dataset based on existing changes on the current machine"""

    class Input:
        dataset_owner = graphene.String(required=True, description="Owner of the dataset to configure")
        dataset_name = graphene.String(required=True, description="Name of the dataset to configure")

    dataset = graphene.Field(Dataset)
    background_job_key = graphene.String(description="Background job key to query on for feedback if needed")

    @classmethod
    def mutate_and_get_payload(cls, root, info, dataset_owner, dataset_name, client_mutation_id=None):
        logged_in_username = get_logged_in_username()
        im = InventoryManager()
        ds = im.load_dataset(logged_in_username, dataset_owner, dataset_name, get_logged_in_author())

        d = Dispatcher()
        kwargs = {
            'logged_in_username': logged_in_username,
            # TODO DJWC - not clear what we need access and id tokens for at this stage. Evaluate and probably delete.
            'access_token': flask.g.access_token,
            'id_token': flask.g.id_token,
            'dataset_owner': dataset_owner,
            'dataset_name': dataset_name,
        }

        background_job_key = None

        # Gen unique keys for tracking jobs
        metadata = {'dataset': f"{logged_in_username}|{dataset_owner}|{dataset_name}",
                    'method': 'update_local_dataset'}

        job_response = d.dispatch_task(gtmcore.dispatcher.dataset_jobs.update_local_dataset,
                                       kwargs=kwargs, metadata=metadata)
        background_job_key = job_response.key_str

        return UpdateLocalDataset(dataset=Dataset(id="{}&{}".format(dataset_owner, dataset_name),
                                                  name=dataset_name, owner=dataset_owner),
                                  background_job_key=background_job_key)


class FetchDatasetEdge(graphene.relay.ClientIDMutation):
    class Input:
        owner = graphene.String(required=True)
        dataset_name = graphene.String(required=True)

    new_dataset_edge = graphene.Field(DatasetConnection.Edge)

    @classmethod
    def mutate_and_get_payload(cls, root, info, owner, dataset_name, client_mutation_id=None):
        cursor = base64.b64encode(f"{0}".encode('utf-8'))
        dsedge = DatasetConnection.Edge(node=Dataset(owner=owner, name=dataset_name),
                                        cursor=cursor)

        return FetchDatasetEdge(new_dataset_edge=dsedge)


class ModifyDatasetLink(graphene.relay.ClientIDMutation):
    """"Mutation to link and unlink Datasets from a Project"""

    class Input:
        labbook_owner = graphene.String(required=True, description="Owner of the labbook")
        labbook_name = graphene.String(required=True, description="Name of the labbook")
        dataset_owner = graphene.String(required=True, description="Owner of the dataset to link")
        dataset_name = graphene.String(required=True, description="Name of the dataset to link")
        action = graphene.String(required=True, description="Action to perform, either `link`, `unlink`, or `update`")
        dataset_url = graphene.String(description="URL to the Dataset to link. Only required when `action=link`")

    new_labbook_edge = graphene.Field(LabbookConnection.Edge)

    @staticmethod
    def _get_remote_domain(dataset_url, dataset_owner, dataset_name):
        """Helper method to get the domain or return none"""
        if "http" in dataset_url:
            dataset_url, _ = dataset_url.split('.git')
            _, _, remote_domain, namespace, name = dataset_url.split("/")
            if namespace != dataset_owner:
                raise ValueError("The dataset owner does not match url")
            if name != dataset_name:
                raise ValueError("The dataset name does not match url")
        else:
            remote_domain = None

        return remote_domain

    @classmethod
    def mutate_and_get_payload(cls, root, info, labbook_owner, labbook_name, dataset_owner, dataset_name, action,
                               dataset_url=None, client_mutation_id=None):
        logged_in_username = get_logged_in_username()
        im = InventoryManager()
        lb = im.load_labbook(logged_in_username, labbook_owner, labbook_name, author=get_logged_in_author())

        with lb.lock():
            if action == 'link':
                if dataset_url:
                    remote_domain = cls._get_remote_domain(dataset_url, dataset_owner, dataset_name)

                    # Make sure git creds are configured for the remote
                    if remote_domain:
                        configure_git_credentials()
                else:
                    # Link to local dataset
                    ds = im.load_dataset(logged_in_username, dataset_owner, dataset_name)
                    dataset_url = f"{ds.root_dir}/.git"

                # Link the dataset to the labbook
                ds = im.link_dataset_to_labbook(dataset_url, dataset_owner, dataset_name, lb, logged_in_username)
                ds.namespace = dataset_owner

                # Preload the dataloader
                info.context.dataset_loader.prime(f"{get_logged_in_username()}&{dataset_owner}&{dataset_name}", ds)

                # Relink the revision
                m = Manifest(ds, logged_in_username)
                m.link_revision()
            elif action == 'unlink':
                im.unlink_dataset_from_labbook(dataset_owner, dataset_name, lb)
            elif action == 'update':
                ds = im.update_linked_dataset_reference(dataset_owner, dataset_name, lb)

                # Reload cache and relink revision due to update
                m = Manifest(ds, logged_in_username)
                m.force_reload()
                m.link_revision()

                info.context.dataset_loader.prime(f"{get_logged_in_username()}&{dataset_owner}&{dataset_name}", ds)
            else:
                raise ValueError("Unsupported action. Use `link`, `unlink`, or `update`")

            info.context.labbook_loader.prime(f"{get_logged_in_username()}&{labbook_owner}&{labbook_name}", lb)
            edge = LabbookConnection.Edge(node=Labbook(owner=labbook_owner, name=labbook_name),
                                          cursor=base64.b64encode(f"{0}".encode('utf-8')))

        return ModifyDatasetLink(new_labbook_edge=edge)


class DeleteDataset(graphene.ClientIDMutation):
    """Delete a dataset."""
    class Input:
        owner = graphene.String(required=True)
        dataset_name = graphene.String(required=True)
        local = graphene.Boolean()
        remote = graphene.Boolean()

    local_deleted = graphene.Boolean()
    remote_deleted = graphene.Boolean()

    @classmethod
    def mutate_and_get_payload(cls, root, info, owner, dataset_name, local=False, remote=False,
                               client_mutation_id=None):
        logged_in_user = get_logged_in_username()
        local_deleted = False
        remote_deleted = False
        if remote:
            logger.info(f"Deleting remote Dataset {owner}/{dataset_name}")

            config = flask.current_app.config['LABMGR_CONFIG']

            # Get tokens from request context
            access_token, id_token = tokens_from_request_context(tokens_required=True)

            try:
                ds = InventoryManager().load_dataset(logged_in_user, owner, dataset_name,
                                                     author=get_logged_in_author())
                remove_remote_config = True
            except InventoryException:
                # Does not exist locally, so create a "mock" Dataset instance
                remove_remote_config = False
                ds = DatasetObj(owner)
                ds._data = {"name": dataset_name}


            if ds.storage_type != "gigantum_object_v1":
                raise GigantumException(f"Remote deletion of {dataset_name} failed, only Gigantum Datasets supported!")

            # We directly use the GigantumObjectStore here, as we don't support remote deletion in any other cases
            ds_backend = GigantumObjectStore()

            ds_backend.delete_contents(ds)

            # Get remote server configuration
            server_config = config.get_server_configuration()

            # Delete the repository
            mgr = GitLabManager(server_config.git_url,
                                server_config.hub_api_url,
                                access_token=access_token,
                                id_token=id_token)
            mgr.remove_repository(owner, dataset_name)
            logger.info(f"Deleted {owner}/{dataset_name} repository from the"
                        f" remote repository {server_config.git_url}")

            # Remove locally any references to that cloud repo that's just been deleted.
            if remove_remote_config:
                try:
                    ds.remove_remote()
                except GigantumException as e:
                    logger.warning(f"Failed to remove remote config from Dataset during Remote Dataset Delete: {e}")

            remote_deleted = True

        if local:
            logger.info(f"Deleting local Dataset {owner}/{dataset_name}")

            # Delete the dataset
            dataset_delete_job = InventoryManager().delete_dataset(logged_in_user, owner, dataset_name)
            local_deleted = True

            if dataset_delete_job is not None:
                # Schedule Job to clear file cache if dataset is no longer in use
                job_metadata = {'method': 'clean_dataset_file_cache'}
                job_kwargs = {
                    'logged_in_username': logged_in_user,
                    'dataset_owner': dataset_delete_job.namespace,
                    'dataset_name': dataset_delete_job.name,
                    'cache_location': dataset_delete_job.cache_root
                }

                dispatcher = Dispatcher()
                job_key = dispatcher.dispatch_task(gtmcore.dispatcher.dataset_jobs.clean_dataset_file_cache, metadata=job_metadata,
                                                   kwargs=job_kwargs)
                logger.info(f"Dispatched clean_dataset_file_cache({owner}/{dataset_name}) to Job {job_key}")

        return DeleteDataset(local_deleted=local_deleted, remote_deleted=remote_deleted)


class SetDatasetDescription(graphene.relay.ClientIDMutation):
    class Input:
        owner = graphene.String(required=True)
        dataset_name = graphene.String(required=True)
        description = graphene.String(required=True)

    updated_dataset = graphene.Field(Dataset)

    @classmethod
    def mutate_and_get_payload(cls, root, info, owner, dataset_name,
                               description, client_mutation_id=None):
        username = get_logged_in_username()
        ds = InventoryManager().load_dataset(username, owner, dataset_name,
                                             author=get_logged_in_author())
        ds.description = description
        with ds.lock():
            ds.git.add(os.path.join(ds.root_dir, '.gigantum/gigantum.yaml'))
            commit = ds.git.commit('Updating description')

            adr = ActivityDetailRecord(ActivityDetailType.LABBOOK,
                                       show=False,
                                       data=TextData('plain',
                                                     f"Updated Dataset description: {description}"))

            ar = ActivityRecord(ActivityType.LABBOOK,
                                message="Updated Dataset description",
                                linked_commit=commit.hexsha,
                                tags=ImmutableList(["dataset"]),
                                show=False,
                                detail_objects=DetailRecordList([adr]))

            ars = ActivityStore(ds)
            ars.create_activity_record(ar)
        return SetDatasetDescription(updated_dataset=Dataset(owner=owner, name=dataset_name))


class WriteDatasetReadme(graphene.relay.ClientIDMutation):
    class Input:
        owner = graphene.String(required=True)
        dataset_name = graphene.String(required=True)
        content = graphene.String(required=True)

    updated_dataset = graphene.Field(Dataset)

    @classmethod
    def mutate_and_get_payload(cls, root, info, owner, dataset_name, content, client_mutation_id=None):
        username = get_logged_in_username()
        ds = InventoryManager().load_dataset(username, owner, dataset_name,
                                             author=get_logged_in_author())

        # Write data
        with ds.lock():
            ds.write_readme(content)

        return WriteDatasetReadme(updated_dataset=Dataset(owner=owner, name=dataset_name))


class VerifyDataset(graphene.ClientIDMutation):
    """Verify the contents of a dataset, returning a job key. The 'modified_keys' value in the metadata indicates
    which files have changed, once the job is complete."""

    class Input:
        dataset_owner = graphene.String(required=True)
        dataset_name = graphene.String(required=True)
        labbook_owner = graphene.String(required=False, description="Optional arg if dataset is linked")
        labbook_name = graphene.String(required=False, description="Optional arg if dataset is linked")

    background_job_key = graphene.String()

    @classmethod
    def mutate_and_get_payload(cls, root, info, dataset_owner, dataset_name, labbook_owner=None, labbook_name=None,
                               client_mutation_id=None):
        logged_in_user = get_logged_in_username()

        # Schedule Job to clear file cache if dataset is no longer in use
        job_metadata = {'method': 'verify_dataset_contents'}
        job_kwargs = {
            'logged_in_username': logged_in_user,
            'access_token': flask.g.access_token,
            'id_token': flask.g.id_token,
            'dataset_owner': dataset_owner,
            'dataset_name': dataset_name,
            'labbook_owner': labbook_owner,
            'labbook_name': labbook_name
        }

        dispatcher = Dispatcher()
        job_key = dispatcher.dispatch_task(gtmcore.dispatcher.dataset_jobs.verify_dataset_contents, metadata=job_metadata,
                                           kwargs=job_kwargs)
        logger.info(f"Dispatched verify_dataset_contents({dataset_owner}/{dataset_name}) to Job {job_key}")

        return VerifyDataset(background_job_key=job_key)
