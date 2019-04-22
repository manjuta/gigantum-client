
import pytest

from gtmcore.inventory.inventory import InventoryManager
from gtmcore.fixtures import mock_config_file
from gtmcore.labbook import SecretStore, SecretStoreException


def init(config):
    im = InventoryManager(config)
    lb = im.create_labbook('test', 'test', 'labbook1')
    return SecretStore(lb)


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

        invalid_values = ['%POWER%/test', '^path', '', '-', '/', '-/-',
                          '/_/-//--/test', ' ']
        for invalid_value in invalid_values:
            with pytest.raises(SecretStoreException):
                secstore['key'] = invalid_value
        assert len(secstore) == 0
