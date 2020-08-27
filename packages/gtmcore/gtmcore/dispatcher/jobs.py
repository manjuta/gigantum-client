import importlib
import json
import os
import time
from typing import Optional
import shutil

from rq import get_current_job

from gtmcore.activity.monitors.devenv import DevEnvMonitorManager
from gtmcore.container import container_for_context
from gtmcore.labbook import LabBook
from gtmcore.gitlib import RepoLocation

from gtmcore.inventory.inventory import InventoryManager
from gtmcore.inventory.branching import MergeConflict
from gtmcore.inventory import Repository

from gtmcore.environment import RepositoryManager
from gtmcore.environment.repository import RepositoryLock
from gtmcore.logging import LMLogger
from gtmcore.workflows import ZipExporter, LabbookWorkflow, DatasetWorkflow, MergeOverride


# PLEASE NOTE -- No global variables!
#
# None of the following methods can use global variables.
# ANY use of globals will cause the following methods to fail.


def publish_repository(repository: Repository, username: str, access_token: str,
                       remote: Optional[str] = None, public: bool = False, id_token: str = None) -> None:
    p = os.getpid()
    logger = LMLogger.get_logger()
    logger.info(f"(Job {p}) Starting publish_repository({str(repository)})")

    def update_feedback(msg: str, has_failures: Optional[bool] = None, failure_detail: Optional[str] = None,
                        percent_complete: Optional[float] = None):
        """Method to update the job's metadata and provide feedback to the UI"""
        current_job = get_current_job()
        if not current_job:
            return
        if has_failures:
            current_job.meta['has_failures'] = has_failures
        if failure_detail:
            current_job.meta['failure_detail'] = failure_detail
        if percent_complete:
            current_job.meta['percent_complete'] = percent_complete

        current_job.meta['feedback'] = msg
        current_job.save_meta()

    update_feedback("Publish task in queue")
    with repository.lock():
        if isinstance(repository, LabBook):
            wf = LabbookWorkflow(repository)
        else:
            wf = DatasetWorkflow(repository)  # type: ignore
        wf.publish(username=username, access_token=access_token, remote=remote or "origin",
                   public=public, feedback_callback=update_feedback, id_token=id_token)


def sync_repository(repository: Repository, username: str, override: MergeOverride,
                    remote: str = "origin", access_token: str = None,
                    pull_only: bool = False, id_token: str = None) -> int:
    p = os.getpid()
    logger = LMLogger.get_logger()
    logger.info(f"(Job {p}) Starting sync_repository({str(repository)})")

    def update_feedback(msg: str, has_failures: Optional[bool] = None, failure_detail: Optional[str] = None,
                        percent_complete: Optional[float] = None):
        """Method to update the job's metadata and provide feedback to the UI"""
        current_job = get_current_job()
        if not current_job:
            return
        if has_failures:
            current_job.meta['has_failures'] = has_failures
        if failure_detail:
            current_job.meta['failure_detail'] = failure_detail
        if percent_complete:
            current_job.meta['percent_complete'] = percent_complete

        current_job.meta['feedback'] = msg
        current_job.save_meta()

    try:
        update_feedback("Sync task in queue")
        with repository.lock():
            if isinstance(repository, LabBook):
                wf = LabbookWorkflow(repository)
            else:
                wf = DatasetWorkflow(repository)  # type: ignore
            cnt = wf.sync(username=username, remote=remote, override=override,
                          feedback_callback=update_feedback, access_token=access_token,
                          id_token=id_token, pull_only=pull_only)
        logger.info(f"(Job {p} Completed sync_repository with cnt={cnt}")
        return cnt
    except MergeConflict as me:
        logger.exception(f"(Job {p}) Merge conflict: {me}")
        raise


def import_labbook_from_remote(remote_url: str, username: str, config_file: str = None) -> str:
    """Return the root directory of the newly imported Project

    Args:
        remote_url: Canonical world-facing URI, like "https://repo.domain/owner/project". This will be converted to the
          actual network location for our repository, like "https://username@repo.domain/owner/project.git/", as
          robustly as we can manage.
        username: username for currently logged in user
        config_file: a copy of the parsed config file

    Returns:
        Path to project root directory
    """
    p = os.getpid()
    logger = LMLogger.get_logger()
    logger.info(f"(Job {p}) Starting import_labbook_from_remote({remote_url}, {username})")

    def update_meta(msg):
        job = get_current_job()
        if not job:
            return
        if 'feedback' not in job.meta:
            job.meta['feedback'] = msg
        else:
            job.meta['feedback'] = job.meta['feedback'] + f'\n{msg}'
        job.save_meta()

    remote = RepoLocation(remote_url, username)
    update_meta(f"Importing Project from {remote.owner_repo!r}...")

    try:
        wf = LabbookWorkflow.import_from_remote(remote, username, config_file)
    except Exception as e:
        update_meta(f"Could not import Project from {remote.remote_location}.")
        logger.exception(f"(Job {p}) Error on import_labbook_from_remote: {e}")
        raise

    update_meta(f"Imported Project {wf.labbook.name}!")
    return wf.labbook.root_dir


def export_labbook_as_zip(labbook_path: str, lb_export_directory: str) -> str:
    """Return path to archive file of exported labbook. """
    p = os.getpid()
    logger = LMLogger.get_logger()
    logger.info(f"(Job {p}) Starting export_labbook_as_zip({labbook_path})")

    try:
        lb = InventoryManager().load_labbook_from_directory(labbook_path)
        with lb.lock():
            path = ZipExporter.export_labbook(lb.root_dir, lb_export_directory)
        return path
    except Exception as e:
        logger.exception(f"(Job {p}) Error on export_labbook_as_zip: {e}")
        raise


def import_labboook_from_zip(archive_path: str, username: str, owner: str,
                             config_file: Optional[str] = None) -> str:
    """Method to import a labbook from a zip file

    Args:
        archive_path(str): Path to the uploaded zip
        username(str): Username
        owner(str): Owner username
        config_file(str): Optional path to a labmanager config file

    Returns:
        str: directory path of imported labbook
    """

    def update_meta(msg):
        job = get_current_job()
        if not job:
            return
        job.meta['feedback'] = msg
        job.save_meta()

    p = os.getpid()
    logger = LMLogger.get_logger()
    logger.info(f"(Job {p}) Starting import_labbook_from_zip(archive_path={archive_path},"
                f"username={username}, owner={owner}, config_file={config_file})")

    try:
        lb = ZipExporter.import_labbook(archive_path, username, owner,
                                        config_file=config_file,
                                        update_meta=update_meta)
        return lb.root_dir
    except Exception as e:
        logger.exception(f"(Job {p}) Error on import_labbook_from_zip({archive_path}): {e}")
        raise
    finally:
        if os.path.exists(archive_path):
            os.remove(archive_path)


def build_labbook_image(path: str, username: str, tag: Optional[str] = None, nocache: bool = False) -> str:
    """Return a docker image ID of given LabBook.

    Args:
        path: Pass-through arg to labbook root.
        username: Username of active user.
        tag: Pass-through arg to tag of docker image.
        nocache(bool): Pass-through arg to docker build.

    Returns:
        Docker image ID
    """
    logger = LMLogger.get_logger()
    logger.info(f"Starting build_labbook_image({path}, {username}, {tag}, {nocache}) in pid {os.getpid()}")

    user_defined_ca_dir = os.path.join(path, '.gigantum', 'env', 'certificates')

    try:
        job = get_current_job()
        if job:
            job.meta['pid'] = os.getpid()
            job.save_meta()

        def save_metadata_callback(line: str) -> None:
            try:
                if not line:
                    return
                job.meta['feedback'] = (job.meta.get('feedback') or '') + line
                job.save_meta()
            except Exception as e:
                logger.error(e)

        save_metadata_callback("Build task in queue\n")
        container_ops = container_for_context(username, path=path, override_image_name=tag)
        container_ops.build_image(nocache=nocache, feedback_callback=save_metadata_callback)

        # Remove all user defined CA certificates. We do not want to leak these by any accidental copy or commit!
        if os.path.isdir(user_defined_ca_dir):
            shutil.rmtree(user_defined_ca_dir)

        logger.info(f"Completed build_labbook_image in pid {os.getpid()}: {container_ops.image_tag}")
        # This used to return and image ID, but this nametag should work equally well for all docker-py operations
        # Also note that we can be certain image_tag is not None, but we add some logic for the type-checker
        return container_ops.image_tag or ''
    except Exception as e:
        if os.path.isdir(user_defined_ca_dir):
            # Remove all user defined CA certificates. We do not want to leak these by any accidental copy or commit!
            shutil.rmtree(user_defined_ca_dir)
        logger.error(f"Error on build_labbook_image in pid {os.getpid()}: {e}")
        raise


def run_dev_env_monitor(dev_env_name, key) -> int:
    """Run method to check if new Activity Monitors for a given dev env need to be started/stopped

        Args:
            dev_env_name(str): Name of the dev env to monitor
            key(str): The unique string used as the key in redis to track this DevEnvMonitor instance

    Returns:
        0 to indicate no failure
    """

    logger = LMLogger.get_logger()
    logger.debug("Checking Dev Env `{}` for activity monitors in PID {}".format(dev_env_name, os.getpid()))

    try:
        demm = DevEnvMonitorManager()
        dev_env = demm.get_monitor_instance(dev_env_name)
        if not dev_env:
            raise ValueError('dev_env is None')
        dev_env.run(key)
        return 0
    except Exception as e:
        logger.error("Error on run_dev_env_monitor in pid {}: {}".format(os.getpid(), e))
        raise e


def start_and_run_activity_monitor(module_name, class_name, user, owner, labbook_name, monitor_key, author_name,
                                   author_email, session_metadata):
    """Run method to run the activity monitor. It is a long running job.

        Args:


    Returns:
        0 to indicate no failure
    """
    logger = LMLogger.get_logger()
    logger.info("Starting Activity Monitor `{}` in PID {}".format(class_name, os.getpid()))

    try:
        # Import the monitor class
        m = importlib.import_module(module_name)
        # get the class
        monitor_cls = getattr(m, class_name)

        # Instantiate monitor class
        monitor = monitor_cls(user, owner, labbook_name, monitor_key,
                              author_name=author_name, author_email=author_email)

        # Start the monitor
        monitor.start(session_metadata)

        return 0
    except Exception as e:
        logger.error("Error on start_and_run_activity_monitor in pid {}: {}".format(os.getpid(), e))
        raise e


def update_environment_repositories() -> None:
    """Method to clone / update the environment repositories

    Returns:
        None
    """
    logger = LMLogger.get_logger()

    lock = RepositoryLock()

    try:
        lock.acquire(failfast=True)
    except:
        logger.warn("Could not acquire repository lock, not updating")
        return

    logger.info("Cloning/Updating environment repositories.")

    try:
        erm = RepositoryManager()
        update_successful = erm.update_repositories()
        if update_successful:
            logger.info("Indexing environment repositories.")
            erm.index_repositories()
            logger.info("Environment repositories updated and ready.")
        else:
            logger.info("Unable to update environment repositories at startup, most likely due to lack of internet access.")
    except Exception as e:
        # If there is an error don't release the lock, as the repositories are
        # not in the expected state
        logger.exception(e)
        logger.critical("Not releasing repository lock, restart API service")
        raise

    lock.release()


def index_labbook_filesystem():
    """To be implemented later. """
    raise NotImplemented


def test_exit_success():
    """Used only for testing -- vacuous method to always succeed and return 0. """
    return 0


def test_exit_fail():
    """Used only for testing -- always throws an exception"""
    raise Exception("Intentional Exception from job `test_exit_fail`")


def test_sleep(n):
    """Used only for testing -- example method with argument. """
    logger = LMLogger.get_logger()
    logger.info("Starting test_sleep({}) in pid {}".format(n, os.getpid()))

    try:
        job = get_current_job()
        job.meta['sample'] = 'test_sleep metadata'
        job.meta['pid'] = int(os.getpid())
        job.save_meta()

        time.sleep(n)
        logger.info("Completed test_sleep in pid {}".format(os.getpid()))
        return 0
    except Exception as e:
        logger.error("Error on test_sleep in pid {}: {}".format(os.getpid(), e))
        raise


def test_incr(path):
    logger = LMLogger.get_logger()
    logger.info("Starting test_incr({}) in pid {}".format(path, os.getpid()))

    try:
        amt = 1
        if not os.path.exists(path):
            logger.info("Creating {}".format(path))
            with open(path, 'w') as fp:
                json.dump({'amt': amt}, fp)
        else:
            logger.info("Loading {}".format(path))
            with open(path, 'r') as fp:
                amt_dict = json.load(fp)
            logger.info("Amt = {}")
            with open(path, 'w') as fp:
                amt_dict['amt'] = amt_dict['amt'] + 1
                json.dump(amt_dict, fp)
            logger.info("Set amt = {} in {}".format(amt_dict['amt'], path))
    except Exception as e:
        logger.error("Error on test_incr in pid {}: {}".format(os.getpid(), e))
        raise
