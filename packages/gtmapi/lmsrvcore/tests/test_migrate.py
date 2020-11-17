import os
from lmsrvcore.utilities.migrate import migrate_work_dir_structure_v2

from lmsrvcore.tests.fixtures import fixture_working_dir_with_cached_user
import pathlib


class TestMigrate(object):
    def test_work_dir_migrate_for_self_hosted(self, fixture_working_dir_with_cached_user):
        config, _ = fixture_working_dir_with_cached_user

        dirs = ['.labmanager',
                '.labmanager/secrets',
                '.labmanager/secrets/test-user1/test-user1/my-project1',
                '.labmanager/secrets/test-user2/test-user2/my-project2',
                '.labmanager/secrets/test-user2/test-user2/my-project3',
                '.labmanager/secrets/test-user2/test-user1/my-project1',
                '.labmanager/datasets/test-user1/test-user1/my-dataset1/objects',
                '.labmanager/datasets/test-user1/test-user1/my-dataset1/1234123412341234',
                '.labmanager/datasets/test-user2/test-user2/my-dataset2',
                '.labmanager/datasets/test-user2/test-user2/my-dataset3',
                '.labmanager/datasets/test-user2/test-user1/my-dataset1',
                'local_data',
                'certificates',
                'export',
                'test-user1',
                'test-user2',
                'test-user3']

        for d in dirs:
            pathlib.Path(os.path.join(config.app_workdir, d)).mkdir(parents=True, exist_ok=True)

        assert os.path.isdir(os.path.join(config.app_workdir, "test-user1"))
        assert os.path.isdir(os.path.join(config.app_workdir, "test-user3"))
        assert os.path.isdir(os.path.join(config.app_workdir, "test-user2"))
        assert os.path.isdir(os.path.join(config.app_workdir, '.labmanager/secrets/test-user1/test-user1/my-project1'))
        assert os.path.isdir(os.path.join(config.app_workdir, '.labmanager/secrets/test-user2/test-user2/my-project2'))
        assert os.path.isdir(os.path.join(config.app_workdir, '.labmanager/secrets/test-user2/test-user2/my-project3'))
        assert os.path.isdir(os.path.join(config.app_workdir, '.labmanager/secrets/test-user2/test-user1/my-project1'))
        assert os.path.isdir(os.path.join(config.app_workdir, '.labmanager/datasets/test-user1/test-user1/my-dataset1'))
        assert os.path.isdir(os.path.join(config.app_workdir, '.labmanager/datasets/test-user2/test-user2/my-dataset2'))
        assert os.path.isdir(os.path.join(config.app_workdir, '.labmanager/datasets/test-user2/test-user2/my-dataset3'))
        assert os.path.isdir(os.path.join(config.app_workdir, '.labmanager/datasets/test-user2/test-user1/my-dataset1'))

        migrate_work_dir_structure_v2('test-gigantum-com')

        assert not os.path.isdir(os.path.join(config.app_workdir, "test-user1"))
        assert not os.path.isdir(os.path.join(config.app_workdir, "test-user3"))
        assert not os.path.isdir(os.path.join(config.app_workdir, "test-user2"))

        assert os.path.isdir(os.path.join(config.app_workdir, "servers", "test-gigantum-com", "test-user1"))
        assert os.path.isdir(os.path.join(config.app_workdir, "servers", "test-gigantum-com", "test-user3"))
        assert os.path.isdir(os.path.join(config.app_workdir, "servers", "test-gigantum-com", "test-user2"))

        assert os.path.isdir(os.path.join(config.app_workdir,
                                          '.labmanager/secrets/test-gigantum-com/test-user1/test-user1/my-project1'))
        assert os.path.isdir(os.path.join(config.app_workdir,
                                          '.labmanager/secrets/test-gigantum-com/test-user2/test-user2/my-project2'))
        assert os.path.isdir(os.path.join(config.app_workdir,
                                          '.labmanager/secrets/test-gigantum-com/test-user2/test-user2/my-project3'))
        assert os.path.isdir(os.path.join(config.app_workdir,
                                          '.labmanager/secrets/test-gigantum-com/test-user2/test-user1/my-project1'))

        assert os.path.isdir(os.path.join(config.app_workdir,
                                          '.labmanager/datasets/test-gigantum-com/test-user1/test-user1/my-dataset1'))
        assert os.path.isdir(os.path.join(config.app_workdir,
                                          '.labmanager/datasets/test-gigantum-com/test-user2/test-user2/my-dataset2'))
        assert os.path.isdir(os.path.join(config.app_workdir,
                                          '.labmanager/datasets/test-gigantum-com/test-user2/test-user2/my-dataset3'))
        assert os.path.isdir(os.path.join(config.app_workdir,
                                          '.labmanager/datasets/test-gigantum-com/test-user2/test-user1/my-dataset1'))
