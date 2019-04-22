import tempfile
import pytest
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
        secstore = init(mock_config_file[0])

        # Test getting length
        assert len(secstore) == 0
        assert [x for x in secstore] == []

    def test_add_remove_secrets(self, mock_config_file):
        secstore = init(mock_config_file[0])

        secstore['aws_creds'] = '/home/usr/.aws'
        assert len(secstore) == 1
        assert [secstore[x] for x in secstore] == ['/home/usr/.aws']
        secstore['other_cred'] = '/mnt/keydir'
        assert len(secstore) == 2
        assert [secstore[x] for x in secstore] == ['/home/usr/.aws', '/mnt/keydir']

        for secret_key in secstore:
            mnt_point = secstore[secret_key]

        del secstore['aws_creds']
        assert len(secstore) == 1
        del secstore['other_cred']
        assert len(secstore) == 0

    def test_add_secret_only_valid_keys(self, mock_config_file):
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
            with open(os.path.join(tempdir, 'ID_SSH.KEY'), 'w') as tf:
                tf.write('<<SUPER SECRET PRIVATE KEY>>')
            with open(os.path.join(tempdir, 'ID_SSH.PUB'), 'w') as tp:
                tp.write('((NOT SO SECRET PUBLIC KEY))')

            secstore[key_name] = mnt_target
            dst_path = secstore.insert_file(tf.name, key_name)

            # Now add a second file for that same key (directory)
            dst_path_2 = secstore.insert_file(tp.name, key_name)

        parts = [secstore.labbook.client_config.app_workdir, '.labmanager',
                 'secrets', 'test', secstore.labbook.owner, secstore.labbook.name,
                 key_name, os.path.basename(dst_path)]
        assumed_path = os.path.join(*parts)
        assert assumed_path == dst_path

        assert secstore.list_files('invalid') == []
        assert secstore.list_files('ssh_creds') == ['ID_SSH.KEY', 'ID_SSH.PUB']

        secstore.delete_files('ssh_creds', ['ID_SSH.KEY'])
        assert secstore.list_files('ssh_creds') == ['ID_SSH.PUB']
        secstore.delete_files('ssh_creds', ['ID_SSH.PUB'])
        assert secstore.list_files('ssh_creds') == []

        secstore.clear_files()
        toks = [secstore.labbook.client_config.app_workdir, '.labmanager', 'secrets',
                'test', secstore.labbook.owner, secstore.labbook.name]
        assert not os.path.exists(*toks)

    def test_insert_file_delete_files_list_files(self, mock_config_file):
        secstore = init(mock_config_file[0])
        key_name, mnt_target = 'ssh_creds', '/opt/.ssh'

        with tempfile.TemporaryDirectory() as tempdir:
            with open(os.path.join(tempdir, 'ID_SSH.KEY'), 'w') as tf:
                tf.write('<<SUPER SECRET PRIVATE KEY>>')
            with open(os.path.join(tempdir, 'ID_SSH.PUB'), 'w') as tp:
                tp.write('((NOT SO SECRET PUBLIC KEY))')

            secstore[key_name] = mnt_target
            dst_path = secstore.insert_file(tf.name, key_name)

            # Now add a second file for that same key (directory)
            dst_path_2 = secstore.insert_file(tp.name, key_name)

        parts = [secstore.labbook.client_config.app_workdir, '.labmanager',
                 'secrets', 'test', secstore.labbook.owner, secstore.labbook.name,
                 key_name, os.path.basename(dst_path)]
        assumed_path = os.path.join(*parts)
        assert assumed_path == dst_path

        assert secstore.list_files('invalid') == []
        assert secstore.list_files('ssh_creds') == ['ID_SSH.KEY', 'ID_SSH.PUB']

        secstore.delete_files('ssh_creds', ['ID_SSH.KEY'])
        assert secstore.list_files('ssh_creds') == ['ID_SSH.PUB']
        secstore.delete_files('ssh_creds', ['ID_SSH.PUB'])
        assert secstore.list_files('ssh_creds') == []


