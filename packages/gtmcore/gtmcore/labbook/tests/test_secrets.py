import tempfile
import pytest
import pprint
import os

from gtmcore.inventory.inventory import InventoryManager
from gtmcore.fixtures import mock_config_file
from gtmcore.labbook import SecretStore, SecretStoreException


def init(config):
    im = InventoryManager(config)
    lb = im.create_labbook('test', 'test', 'labbook1')
    return SecretStore(lb, 'test')


class TestLabbookSecret(object):
    def test_init(self, mock_config_file):
        """
        Test a simple secret store that is empty.
        """
        secstore = init(mock_config_file[0])
        assert len(secstore) == 0
        assert [x for x in secstore] == []

    def test_insert_file_delete_files_list_files(self, mock_config_file):
        secstore = init(mock_config_file[0])
        mnt_target = '/opt/.ssh'

        with tempfile.TemporaryDirectory() as tempdir:
            with open(os.path.join(tempdir, 'ID_SSH.KEY'), 'w') as t1:
                t1.write('<<SUPER SECRET PRIVATE KEY>>')
            with open(os.path.join(tempdir, 'ID_SSH.PUB'), 'w') as t2:
                t2.write('((NOT SO SECRET PUBLIC KEY))')

            keyfile_dst_1 = secstore.insert_file(t1.name, mnt_target)
            keyfile_dst_2 = secstore.insert_file(t2.name, mnt_target)

        parts = [secstore.labbook.client_config.app_workdir, '.labmanager',
                 'secrets', 'test', secstore.labbook.owner, secstore.labbook.name,
                 os.path.basename(keyfile_dst_1)]
        assumed_path = os.path.join(*parts)
        assert assumed_path == keyfile_dst_1

        # But properly return the two inserted files for the correct keys
        assert secstore.list_files() == ['ID_SSH.KEY', 'ID_SSH.PUB']

        # Test that delete removes a file properly by using list_files
        secstore.delete_file('ID_SSH.KEY')
        assert secstore.list_files() == ['ID_SSH.PUB']
        secstore.delete_file('ID_SSH.PUB')
        assert secstore.list_files() == []

        # Test clear_files works by making sure the vault itself doesn't exist
        secstore.clear_files()
        toks = [secstore.labbook.client_config.app_workdir, '.labmanager', 'secrets',
                'test', secstore.labbook.owner, secstore.labbook.name]
        assert not os.path.exists(os.path.join(*toks))

    def test_insert_cannot_overwrite(self, mock_config_file):
        """
        Confirm that you cannot overwrite a given file.
        """
        secstore = init(mock_config_file[0])
        mnt_target = '/opt/.ssh'

        with tempfile.TemporaryDirectory() as tempdir:
            with open(os.path.join(tempdir, 'ID_SSH.KEY'), 'w') as t1:
                t1.write('CORRECT_DATA')
            keyfile_dst_1 = secstore.insert_file(t1.name, mnt_target)

        with tempfile.TemporaryDirectory() as tempdir:
            with open(os.path.join(tempdir, 'ID_SSH.KEY'), 'w') as t2:
                t2.write('BAD_DATA')
            with pytest.raises(SecretStoreException):
                keyfile_dst_2 = secstore.insert_file(t2.name, mnt_target)

        assert secstore.list_files() == ['ID_SSH.KEY']
        assert open(keyfile_dst_1).read() == 'CORRECT_DATA'
        assert len(secstore.as_mount_dict) == 1

    def test_remove_keyfile_not_existing(self, mock_config_file):
        secstore = init(mock_config_file[0])
        mnt_target = '/opt/.ssh'

        with pytest.raises(SecretStoreException):
            secstore.delete_file('catfile')

        assert secstore.list_files() == []
        assert len(secstore.as_mount_dict) == 0
