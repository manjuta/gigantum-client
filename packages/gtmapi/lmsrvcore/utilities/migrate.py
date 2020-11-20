from gtmcore.configuration import Configuration
import os
import shutil

from gtmcore.logging import LMLogger

logger = LMLogger.get_logger()


def migrate_work_dir_structure_v2(server_id: str) -> None:
    """Function to reorganize working directory data to be sorted by server_id. This assumes no migration has previously
    run

    Args:
        server_id: server id to move user dirs into

    """
    __migrate_repository_data(server_id)

    __migrate_sensitive_file_data(server_id)

    __migrate_dataset_file_cache_data(server_id)


def __migrate_repository_data(server_id: str) -> None:
    """Function to move all user directories into the default server directory in the updated work dir structure

    This change has been made to support multiple servers and self-hosted deployments. It also organizes user data
    better as user dirs aren't right next to other "client-level" directories.

    Args:
        server_id: server id to move user dirs into

    """
    # List dirs in root working dir
    config = Configuration()
    dirs_to_move = list()
    for d in os.listdir(config.app_workdir):
        if d in ['.labmanager', 'export', 'local_data', 'certificates', 'servers', '.DS_Store']:
            # Ignore non-user directories
            continue

        dirs_to_move.append(d)

    # Move all user folders
    for d in dirs_to_move:
        shutil.move(os.path.join(config.app_workdir, d),
                    os.path.join(config.server_data_dir, server_id, d))
        logger.info(f"Moved user dir `{d}` into `{server_id}` server dir")


def __migrate_sensitive_file_data(server_id: str) -> None:
    """Function to reorganize sensitive file data

    Args:
        server_id: server id to move user dirs into

    """
    config = Configuration()
    old_root = os.path.join(config.app_workdir, '.labmanager', 'secrets')
    if not os.path.isdir(old_root):
        logger.info("No old sensitive file location while attempting to migrate. Skipping.")
        return

    dirs_to_move = list()
    for d in os.listdir(old_root):
        dirs_to_move.append(d)

    # Move all user folders
    os.makedirs(os.path.join(old_root, server_id), exist_ok=True)
    for d in dirs_to_move:
        shutil.move(os.path.join(old_root, d),
                    os.path.join(old_root, server_id, d))
        logger.info(f"Moved sensitive file user dir `{d}` into `{server_id}` dir")


def __migrate_dataset_file_cache_data(server_id: str) -> None:
    """Function to reorganize dataset file cache data

    Args:
        server_id: server id to move user dirs into

    """
    config = Configuration()
    old_root = os.path.join(config.app_workdir, '.labmanager', 'datasets')

    if not os.path.isdir(old_root):
        logger.info("No old dataset file cache location while attempting to migrate. Skipping.")
        return

    dirs_to_move = list()
    for d in os.listdir(old_root):
        dirs_to_move.append(d)

    # Move all user folders
    os.makedirs(os.path.join(old_root, server_id), exist_ok=True)
    for d in dirs_to_move:
        shutil.move(os.path.join(old_root, d),
                    os.path.join(old_root, server_id, d))
        logger.info(f"Moved dataset file cache dir `{d}` into `{server_id}` dir")
