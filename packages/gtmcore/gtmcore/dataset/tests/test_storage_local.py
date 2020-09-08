import pytest

import os

from gtmcore.dataset.storage.local import LocalFilesystemBackend
from gtmcore.dataset.manifest.manifest import Manifest
from gtmcore.fixtures.datasets import mock_dataset_with_local_data


class TestStorageBackendLocalFilesystem(object):
    def test_backend_configured(self, mock_dataset_with_local_data):
        """In the fixture, we create a dataset and just ensure that it finishes without error"""
        ds = mock_dataset_with_local_data[0]
        assert isinstance(ds.backend, LocalFilesystemBackend)

    @pytest.mark.skip
    def test_load_existing_local_dataset(self, mock_dataset_with_local_data):
        """Can we load a dataset from the filesystem?"""
        pass

    @pytest.mark.skip
    def test_configured_local_mount(self):
        """Can we create a dataset on a configured mount-point?"""
        # This will be annoying to test because it depends on a different launch configuration.
        # It seems reasonable to just configure the client with a host mount from a temp directory or something...
        pass

    def test_update_from_local(self, mock_dataset_with_local_data):
        ds = mock_dataset_with_local_data[0]

        assert ds.backend.can_update_from_remote() is True

        m = Manifest(ds, 'tester')
        assert len(m.manifest.keys()) == 0

        ds.backend.update_from_remote(ds, print)

        m = Manifest(ds, 'tester')
        assert len(m.manifest.keys()) == 4
        assert os.path.isfile(os.path.join(m.cache_mgr.cache_root, m.dataset_revision, 'test1.txt'))
        assert os.path.isfile(os.path.join(m.cache_mgr.cache_root, m.dataset_revision, 'test2.txt'))
        assert os.path.isfile(os.path.join(m.cache_mgr.cache_root, m.dataset_revision, 'subdir', 'test3.txt'))

        modified_items = ds.backend.verify_contents(ds, print)
        assert len(modified_items) == 0

        test_dir = os.path.join(ds.client_config.app_workdir, "local_data", "test_dir")
        with open(os.path.join(test_dir, 'test1.txt'), 'wt') as tf:
            tf.write("This file got changed in the filesystem")

        modified_items = ds.backend.verify_contents(ds, print)
        assert len(modified_items) == 1
        assert 'test1.txt' in modified_items

        ds.backend.update_from_local(ds, print, verify_contents=True)
        assert len(m.manifest.keys()) == 4
        assert os.path.isfile(os.path.join(m.cache_mgr.cache_root, m.dataset_revision, 'test1.txt'))
        assert os.path.isfile(os.path.join(m.cache_mgr.cache_root, m.dataset_revision, 'test2.txt'))
        assert os.path.isfile(os.path.join(m.cache_mgr.cache_root, m.dataset_revision, 'subdir', 'test3.txt'))

        modified_items = ds.backend.verify_contents(ds, print)
        assert len(modified_items) == 0

        with open(os.path.join(m.cache_mgr.cache_root, m.dataset_revision, 'test1.txt'), 'rt') as tf:
            assert tf.read() == "This file got changed in the filesystem"
