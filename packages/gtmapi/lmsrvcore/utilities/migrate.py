from gtmcore.configuration import Configuration
import os
import shutil

from gtmcore.logging import LMLogger

logger = LMLogger.get_logger()


def migrate_work_dir_structure_v2(server_id: str) -> None:
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
        if d in ['.labmanager', 'export', 'local_data', 'certificates', 'servers']:
            # Ignore non-user directories
            continue

        dirs_to_move.append(d)

    # Move all user folders
    for d in dirs_to_move:
        shutil.move(os.path.join(config.app_workdir, d),
                    os.path.join(config.server_data_dir, server_id, d))
        logger.info(f"Moved user dir `{d}` into `{server_id}` server dir")
