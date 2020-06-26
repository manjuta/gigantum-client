import time
import glob
import os
import rq
from typing import Any, Tuple, Dict, List

from gtmcore.logging import LMLogger
from gtmcore.inventory.inventory import InventoryManager
from gtmcore.dispatcher import default_redis_conn
from gtmcore.configuration import Configuration
from gtmcore.configuration.utils import call_subprocess

DISK_WARNING_THRESHOLD_GB = 2.5
logger = LMLogger.get_logger()


def check_projects(config: Configuration, username: str) -> Dict[str, Any]:
    """ Crawl through all projects to check for errors on loading or accessing imporant fields.
    Warning: This method may take a while.

    Args:
        config: Configuration to include root gigantum directory
        username: Active username - if none provided crawl for all users.

    Returns:
        Dictionary mapping a project path to errors

    Schema:
    {
        'errors': {
            'username/owner/labbooks/project-name': 'This is the error msg'
        },
        '_collectionTimeSec': 2.0
    }
    """
    gigantum_root = config.app_workdir
    project_paths = glob.glob(f'{gigantum_root}/{username}/*/labbooks/*')
    inventory = InventoryManager(config.config_file)
    t0 = time.time()
    errors: Dict[str, Any] = {'errors': {}}
    for project_path in project_paths:
        try:
            # Try to load the labbook, and it's important fields.
            labbook = inventory.load_labbook_from_directory(project_path)
            _ = labbook.creation_date, labbook.modified_on, labbook.data
        except Exception as e:
            logger.error(e)
            errors['errors'][project_path.replace(gigantum_root, '')] = str(e)
    tfin = time.time()
    errors['_collectionTimeSec'] = float(f'{tfin - t0:.2f}')
    return errors


def service_telemetry():
    # TODO: Use a dataclass to represent this
    t0 = time.time()
    mem_total, mem_avail = _calc_mem_free()
    disk_total, disk_avail = _calc_disk_free_gb()
    nvidia_driver = os.environ.get('NVIDIA_DRIVER_VERSION')
    try:
        rq_dict = _calc_rq_free()
    except Exception as e:
        rq_dict = {'collectionError': str(e)}

    compute_time = time.time() - t0
    return {
        'memoryKb': {
            'total': mem_total,
            'available': mem_avail
        },
        'diskGb': {
            'total': disk_total,
            'available': disk_avail,
            'lowDiskWarning': disk_avail < DISK_WARNING_THRESHOLD_GB
        },
        'rq': rq_dict,
        # How long it took to collect stats - round to two decimal places
        'collectionTimeSec': float(f'{compute_time:.2f}'),
        'gpu': {
            'isAvailable': bool(nvidia_driver),
            # If None, becomes 'None'
            'nvidiaVersion': str(nvidia_driver)
        }
    }


def _calc_mem_free() -> Tuple[int, int]:
    mem_results = call_subprocess(['free'], cwd='/')
    hdr, vals, _, _ = mem_results.split('\n')
    mem_total, mem_available = int(vals.split()[1]), int(vals.split()[-1])
    return mem_total, mem_available


def _calc_disk_free_gb() -> Tuple[float, float]:
    """Call `df` from the Client Container, parse and return as GB"""
    # -BMB asks df to return counts in MB-sized blocks (10**6, NOT 2**20)
    disk_results = call_subprocess("df -BMB /mnt/gigantum".split(), cwd='/').split('\n')
    _, disk_size, disk_used, disk_avail, use_pct, _ = disk_results[1].split()

    disk_size_num, disk_size_unit = float(disk_used[:-2]) / 1000, disk_used[-2:]
    if disk_size_unit != 'MB':
        raise ValueError(f'Encountered unexpected unit "{disk_size_unit}" from `df -BMB` in Client')

    disk_avail_num, disk_avail_unit = float(disk_avail[:-2]) / 1000, disk_avail[-2:]
    if disk_avail_unit != 'MB':
        raise ValueError(f'Encountered unexpected unit "{disk_avail_unit}" from `df -BMB` in Client')

    return disk_size_num, disk_avail_num


def _calc_rq_free() -> Dict[str, Any]:
    """Parses the output of `rq info` to return total number
    of workers and the count of workers currently idle."""

    conn = default_redis_conn()
    with rq.Connection(connection=conn):
        workers: List[rq.Worker] = [w for w in rq.Worker.all()]
    idle_workers = [w for w in workers if w.get_state() == 'idle']
    resp = {
        'workersTotal': len(workers),
        'workersIdle': len(idle_workers),
        'workersUnknown': len([w for w in workers if w.get_state() == '?'])
    }
    queues = 'default', 'build', 'publish'
    resp.update({f'queue{q.capitalize()}Size':
                 len(rq.Queue(f'gigantum-{q}-queue', connection=conn)) for q in queues})
    return resp
