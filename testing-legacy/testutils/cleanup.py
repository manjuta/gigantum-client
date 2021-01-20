import os
import logging
import shutil
import glob
import docker

import testutils


def stop_project_containers():
    containers = docker.from_env().containers.list()
    for c in containers:
        for t in c.image.tags:
            if 'gmlb-' in t:
                logging.info(f"Stopping container for image {t}")
                c.stop()
    docker.from_env().containers.prune()


def delete_project_images():
    images = docker.from_env().images.list()
    for img in images:
        for tag in img.tags:
            if 'gmlb-' in tag and 'selenium-project-' in tag:
                logging.info(f"Deleting container for image {tag}")
                docker.from_env().images.remove(img.id, force=True, noprune=False)
                break


def delete_projects_on_disk():
    root_dir = os.path.expanduser(os.environ['GIGANTUM_HOME'])
    root_dir = os.path.join(root_dir, 'servers', testutils.current_server_id())
    if os.name == 'nt':
        user_projects = glob.glob(f'{root_dir}\*\*\labbooks\selenium-project-*')
    else:
        user_projects = glob.glob(f'{root_dir}/*/*/labbooks/selenium-project-*')
    for user_project_path in user_projects:
        logging.info(f"Deleting directory: {user_project_path}")
        if os.name == 'nt':
            os.system('rmdir /S /Q "{}"'.format(user_project_path))
        else:
            shutil.rmtree(user_project_path, ignore_errors=True)


def delete_local_datasets():
    root_dir = os.path.expanduser(os.environ['GIGANTUM_HOME'])
    server_dir = os.path.join(root_dir, 'servers', testutils.current_server_id())
    dataset_file_cache_dir = os.path.join(root_dir, '.labmanager', 'datasets', testutils.current_server_id())
    if os.name == 'nt':
        user_datasets = glob.glob(f'{server_dir}\*\*\datasets\selenium-dataset-*')
        cache_datasets = glob.glob(f'{dataset_file_cache_dir}\*\*\selenium-dataset-*')
    else:
        user_datasets = glob.glob(f'{root_dir}/*/*/datasets/selenium-dataset-*')
        cache_datasets = glob.glob(f'{dataset_file_cache_dir}/*/*/selenium-dataset-*')

    for user_dataset_path in user_datasets:
        logging.info(f"Deleting directory: {user_dataset_path}")
        if os.name == 'nt':
            os.system('rmdir /S /Q "{}"'.format(user_dataset_path))
        else:
            shutil.rmtree(user_dataset_path, ignore_errors=False)

    for cache_ds in cache_datasets:
        logging.info(f"Delete directory: {cache_ds}")

        if os.name == 'nt':
            os.system('rmdir /S /Q "{}"'.format(cache_ds))
        else:
            shutil.rmtree(cache_ds, ignore_errors=False)
