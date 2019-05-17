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

    def test_add_remove_secrets(self, mock_config_file):
        """
        test dict-like set and del operations for secrets - ensure they undo each other.
        """
        secstore = init(mock_config_file[0])
        secstore['aws_creds'] = '/home/usr/.aws'
        assert len(secstore) == 1
        assert [secstore[x] for x in secstore] == ['/home/usr/.aws']
        secstore['other_cred'] = '/mnt/keydir'
        assert len(secstore) == 2
        assert [secstore[x] for x in secstore] == ['/home/usr/.aws', '/mnt/keydir']

        del secstore['aws_creds']
        assert len(secstore) == 1
        del secstore['other_cred']
        assert len(secstore) == 0

    def test_add_secret_only_valid_keys(self, mock_config_file):
        """
        Test that you cannot insert a key into the mounted
        directory of the project. (As this could cause the secret file
        to get tracked by Git).
        """
        secstore = init(mock_config_file[0])

        # Test that you cannot add a key that will be stored in the project
        # As this would add it to a Git-tracked object
        with pytest.raises(SecretStoreException):
            secstore['cant_do_this'] = '/mnt/labbook/input/secret'
        assert len(secstore) == 0

        # ONLY alphanumeric tokens separated by '-' or '_' are valid keys,
        # as they will become directory names
        invalid_keys = ["cat's", 'cat"s', '', ' ', '$%&*', '-', '_', '---']
        for invalid_key in invalid_keys:
            with pytest.raises(SecretStoreException):
                secstore[invalid_key] = '/path/to/whatever'
        assert len(secstore) == 0

        invalid_values = ['%POWER%/test', '^path', '', '-', '/', '-/-', ' ']
        for invalid_value in invalid_values:
            with pytest.raises(SecretStoreException):
                secstore['key'] = invalid_value
        assert len(secstore) == 0

    def test_insert_file_delete_files_list_files(self, mock_config_file):
        secstore = init(mock_config_file[0])
        key_name, mnt_target = 'ssh_creds', '/opt/.ssh'

        with tempfile.TemporaryDirectory() as tempdir:
            with open(os.path.join(tempdir, 'ID_SSH.KEY'), 'w') as t1:
                t1.write('<<SUPER SECRET PRIVATE KEY>>')
            with open(os.path.join(tempdir, 'ID_SSH.PUB'), 'w') as t2:
                t2.write('((NOT SO SECRET PUBLIC KEY))')

            secstore[key_name] = mnt_target
            keyfile_dst_1 = secstore.insert_file(t1.name, key_name)
            keyfile_dst_2 = secstore.insert_file(t2.name, key_name)

        parts = [secstore.labbook.client_config.app_workdir, '.labmanager',
                 'secrets', 'test', secstore.labbook.owner, secstore.labbook.name,
                 key_name, os.path.basename(keyfile_dst_1)]
        assumed_path = os.path.join(*parts)
        assert assumed_path == keyfile_dst_1

        # Return an empty list when getting the files for a key not found
        assert secstore.list_files('this-key-does-not-exist') == []

        # But properly return the two inserted files for the correct keys
        assert secstore.list_files('ssh_creds') == ['ID_SSH.KEY', 'ID_SSH.PUB']

        # Test that delete removes a file properly by using list_files
        secstore.delete_files('ssh_creds', ['ID_SSH.KEY'])
        assert secstore.list_files('ssh_creds') == ['ID_SSH.PUB']
        secstore.delete_files('ssh_creds', ['ID_SSH.PUB'])
        assert secstore.list_files('ssh_creds') == []

        # Test clear_files works by making sure the vault itself doesn't exist
        secstore.clear_files()
        toks = [secstore.labbook.client_config.app_workdir, '.labmanager', 'secrets',
                'test', secstore.labbook.owner, secstore.labbook.name]
        assert not os.path.exists(os.path.join(*toks))

    # def test_multiple_keys_map_to_one_directory(self, mock_config_file):
    #     secstore = init(mock_config_file[0])
    #     mnt_target = '/opt/.ssh'
    #     key_name_1 = 'pub_key_file'
    #     key_name_2 = 'pri_key_file'
    #
    #     secstore[key_name_1] = mnt_target
    #     secstore[key_name_2] = mnt_target
    #
    #     with tempfile.TemporaryDirectory() as tempdir:
    #         with open(os.path.join(tempdir, 'ID_SSH.KEY'), 'w') as t1:
    #             t1.write('<<SUPER SECRET PRIVATE KEY>>')
    #         with open(os.path.join(tempdir, 'ID_SSH.PUB'), 'w') as t2:
    #             t2.write('((NOT SO SECRET PUBLIC KEY))')
    #
    #         keyfile_dst_1 = secstore.insert_file(t1.name, key_name_1)
    #         keyfile_dst_2 = secstore.insert_file(t2.name, key_name_2)
