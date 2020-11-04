import os
import shutil
import pytest

from mock import patch

from gtmcore.configuration import Configuration
from gtmcore.container import container_for_context
from gtmcore.environment import ComponentManager
from gtmcore.inventory.inventory  import InventoryManager
from gtmcore.imagebuilder import ImageBuilder
from gtmcore.fixtures.fixtures import mock_config_with_repo, ENV_UNIT_TEST_REPO, ENV_UNIT_TEST_BASE, ENV_UNIT_TEST_REV


class ContainerFixture(object):
    """ Convenient namespace object for the unwieldy build_lb_image_for_jupyterlab
    fixture. """
    def __init__(self, fixture_data):
        # yield lb, ib, client, docker_image_id, container_id, None, 'unittester'
        self.labbook = fixture_data[0]
        self.imagebuilder = fixture_data[1]
        self.docker_client = fixture_data[2]
        self.docker_image_id = fixture_data[3]
        self.docker_container_id = fixture_data[4]
        self._ = fixture_data[5]
        self.username = fixture_data[6]


@pytest.fixture(scope='function')
def build_lb_image_for_jupyterlab(mock_config_with_repo):
    im = InventoryManager()
    lb = im.create_labbook('unittester', 'unittester', "containerunittestbook")

    cm = ComponentManager(lb)
    cm.add_base(ENV_UNIT_TEST_REPO, ENV_UNIT_TEST_BASE, ENV_UNIT_TEST_REV)
    cm.add_packages("pip", [{"manager": "pip", "package": "requests", "version": "2.18.4"}])

    ib = ImageBuilder(lb)
    docker_lines = ib.assemble_dockerfile(write=True)
    assert 'RUN pip install requests==2.18.4' in docker_lines
    assert all(['==None' not in l for l in docker_lines.split()])
    assert all(['=None' not in l for l in docker_lines.split()])
    lb_container = container_for_context(username="unittester", labbook=lb)
    client = lb_container._client
    client.containers.prune()

    assert os.path.exists(os.path.join(lb.root_dir, '.gigantum', 'env', 'entrypoint.sh'))

    try:
        lb_container.build_image()
        lb_container.start_project_container()

        # Keeping some more low-level checks here for now, even though they may break tests on cloud
        assert isinstance(lb_container._container.id, str)
        yield lb, ib, client, lb_container._image_id, lb_container.image_tag, None, 'unittester'

        lb_container.stop_container()
    finally:
        shutil.rmtree(lb.root_dir, ignore_errors=True)
        # Stop and remove container if it's still there
        try:
            client.containers.get(lb_container.image_tag).stop(timeout=2)
            client.containers.get(lb_container.image_tag).remove()
        except:
            pass

        # Remove image if it's still there
        try:
            if not lb_container.delete_image():
                client.images.remove(lb_container.image_tag, force=True, noprune=False)
        except:
            pass


@pytest.fixture(scope='function')
def build_lb_image_for_rstudio(mock_config_with_repo):
    """A far more minimal fixture than the one for jupyterlab

    Generally, given the extra complexity of RStudio, when we're beating on other parts of the system, we should default
    to Jupyter. For similar reasons, we don't do nearly as many checks as are done in the jupyterlab fixture.
    """
    username = 'soycapitan'
    im = InventoryManager()
    lb = im.create_labbook(username, username, "containerunittestbookrstudio")

    cm = ComponentManager(lb)
    cm.add_base(ENV_UNIT_TEST_REPO, 'ut-rstudio-server', 1)

    ib = ImageBuilder(lb)
    docker_lines = ib.assemble_dockerfile(write=True)
    lb_container = container_for_context(username=username, labbook=lb)
    # Here and we use the private docker client for LocalProjectContainer that may fail on cloud
    client = lb_container._client
    client.containers.prune()

    try:
        lb_container.build_image()
        lb_container.start_project_container()

        yield lb_container, ib, username

        lb_container.stop_container()
    finally:
        shutil.rmtree(lb.root_dir, ignore_errors=True)
        # Stop and remove container if it's still there
        try:
            client.containers.get(lb_container.image_tag).stop(timeout=2)
            client.containers.get(lb_container.image_tag).remove()
        except:
            pass

        # Remove image if it's still there
        try:
            if not lb_container.delete_image():
                client.images.remove(lb_container.image_tag, force=True, noprune=False)
        except:
            pass


@pytest.fixture(scope='class')
def build_lb_image_for_env(mock_config_with_repo):
    # Create a labook
    im = InventoryManager()
    lb = im.create_labbook('unittester', 'unittester', "containerunittestbookenv",
                           description="Testing environment functions.")

    # Create Component Manager
    cm = ComponentManager(lb)
    # Add a component
    cm.add_base(ENV_UNIT_TEST_REPO, ENV_UNIT_TEST_BASE, ENV_UNIT_TEST_REV)

    ib = ImageBuilder(lb)
    ib.assemble_dockerfile(write=True)
    project_container = container_for_context(username="unittester", labbook=lb)
    client = project_container._client
    client.containers.prune()

    try:
        project_container.build_image()

        yield lb, 'unittester'

    finally:
        shutil.rmtree(lb.root_dir)

        # Remove image if it's still there
        try:
            client.images.remove(project_container._image_id, force=True, noprune=False)
        except:
            pass


@pytest.fixture(scope='class')
def build_lb_image_for_env_conda(mock_config_with_repo):
    """A fixture that installs an old version of matplotlib and latest version of requests to increase code coverage"""
    im = InventoryManager()
    lb = im.create_labbook('unittester', 'unittester', "containerunittestbookenvconda",
                           description="Testing environment functions.")
    cm = ComponentManager(lb)
    cm.add_base(ENV_UNIT_TEST_REPO, ENV_UNIT_TEST_BASE, ENV_UNIT_TEST_REV)
    cm.add_packages('conda3', [{'package': 'python-coveralls', 'version': '2.7.0'}])

    ib = ImageBuilder(lb)
    ib.assemble_dockerfile(write=True)
    project_container = container_for_context(username="unittester", labbook=lb)
    client = project_container._client
    client.containers.prune()

    try:
        project_container.build_image()

        yield lb, 'unittester'

    finally:
        shutil.rmtree(lb.root_dir)
        try:
            client.images.remove(project_container.image_tag, force=True, noprune=False)
        except:
            pass
