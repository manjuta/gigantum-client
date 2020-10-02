import os
from lmsrvcore.utilities.migrate import migrate_work_dir_structure_v2

from lmsrvcore.tests.fixtures import fixture_working_dir_with_cached_user


class TestMigrate(object):
    def test_work_dir_migrate_for_self_hosted(self, fixture_working_dir_with_cached_user):
        config, _ = fixture_working_dir_with_cached_user

        dirs = ['local_data',
                'certificates',
                'export',
                'test-user1',
                'test-user2',
                'test-user3']

        for d in dirs:
            os.makedirs(os.path.join(config.app_workdir, d))

        assert os.path.isdir(os.path.join(config.app_workdir, "test-user1"))
        assert os.path.isdir(os.path.join(config.app_workdir, "test-user3"))
        assert os.path.isdir(os.path.join(config.app_workdir, "test-user2"))

        migrate_work_dir_structure_v2('test-gigantum-com')

        assert not os.path.isdir(os.path.join(config.app_workdir, "test-user1"))
        assert not os.path.isdir(os.path.join(config.app_workdir, "test-user3"))
        assert not os.path.isdir(os.path.join(config.app_workdir, "test-user2"))

        assert os.path.isdir(os.path.join(config.app_workdir, "servers", "test-gigantum-com", "test-user1"))
        assert os.path.isdir(os.path.join(config.app_workdir, "servers", "test-gigantum-com", "test-user3"))
        assert os.path.isdir(os.path.join(config.app_workdir, "servers", "test-gigantum-com", "test-user2"))
