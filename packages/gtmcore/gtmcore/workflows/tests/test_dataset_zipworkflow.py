
import pytest
import shutil
import tempfile
import subprocess
import os
from pkg_resources import resource_filename

from gtmcore.inventory.inventory  import InventoryManager, InventoryException
from gtmcore.configuration import Configuration
from gtmcore.workflows import ZipExporter, ZipWorkflowException

from gtmcore.fixtures import (mock_config_file, mock_labbook_lfs_disabled,
                              sample_src_file, helper_create_remote_repo as _MOCK_create_remote_repo)


class TestDatasetImportZipping(object):
    def test_fail_import_garbled(self, mock_config_file):
        # Baseline state of gigantum dir (used to check no new files created)
        snapshot = str(list(sorted(os.walk(mock_config_file[1]))))
        z = ZipExporter()
        
        # Test with a non-existing file
        with pytest.raises(ZipWorkflowException):
            z.import_dataset('nonsense.zip', 'none', 'none')
        assert snapshot == str(list(sorted(os.walk(mock_config_file[1]))))

        # Test with an invalid zip file
        with open('/tmp/invalid.zip', 'wb') as x:
            x.write(b'Invalid zip file content. ' * 500)
        with pytest.raises(ZipWorkflowException):
            z.import_dataset(x.name, 'none', 'none')
        assert snapshot == str(list(sorted(os.walk(mock_config_file[1]))))

    def test_fail_import_non_dataset_zip_single_file(self, mock_config_file):
        # Test a valid zip file but one that does not contain project

        # make a zip of a single file
        with open('/tmp/single_file_zip.file', 'wb') as f:
            f.write(b'abc123' * 500)
        subprocess.run('zip -r single_file_zip.zip single_file_zip.file'.split(),
                       check=True, cwd='/tmp')
        assert os.path.isfile('/tmp/single_file_zip.zip')

        # Baseline state of gigantum dir (used to check no new files created)
        snapshot = str(list(sorted(os.walk(mock_config_file[1]))))
        z = ZipExporter()
        with pytest.raises(ZipWorkflowException):
            z.import_dataset('/tmp/single_file_zip.zip', 'test', 'test')

    def test_fail_import_non_dataset_zip_directory(self, mock_config_file):
        # Test a valid zip file but one that does not contain project

        # make a zip of a directory
        dirs = ['code', '.git', '.gigantum', '.labbook', 'input', 'output']
        for d in dirs:
            os.makedirs(os.path.join('/tmp/non-ds-dir', d), exist_ok=True)
            with open(os.path.join('/tmp/non-ds-dir', d, 'file.f'), 'wb') as f:
                f.write(b'file content. ' * 40)
        subprocess.run('zip -r non-ds-dir.zip non-ds-dir'.split(),
                       check=True, cwd='/tmp')

        # Baseline state of gigantum dir (used to check no new files created)
        pre_snapshot = str(list(sorted(os.walk(mock_config_file[1]))))
        z = ZipExporter()
        with pytest.raises(ZipWorkflowException):
            z.import_dataset('/tmp/non-ds-dir.zip', 'test', 'test')
        post_snapshot = str(list(sorted(os.walk(mock_config_file[1]))))
        assert pre_snapshot == post_snapshot

    def test_fail_export_garbled_export(self):
        # Test giving a path that doesn't exist
        with pytest.raises(ZipWorkflowException):
            ZipExporter.export_dataset('/not/a/real/path', '.')

    def test_fail_export_not_a_dataset(self):
        # Pass in a valid directory, but one that is not an LB
        with pytest.raises(ZipWorkflowException):
            ZipExporter.export_dataset('/var', '.')

    def test_success_import_valid_dataset_from_macos(self, mock_config_file):
        import_zip = os.path.join(resource_filename('gtmcore', 'workflows/tests'), 'test_dataset.zip')
        assert os.path.exists(import_zip)
        dup_import = shutil.copy(import_zip, '/tmp/copy-of-test_dataset.zip')

        workspace = Configuration().app_workdir

        # Snapshots of directories before and after import - assert different
        pre_snapshot = str(list(sorted(os.walk(workspace))))
        z = ZipExporter()
        x = z.import_dataset(dup_import, 'test', 'test')
        post_snapshot = str(list(sorted(os.walk(workspace))))
        assert pre_snapshot != post_snapshot
        assert x.active_branch == 'master'

    def test_fail_cannot_import_dataset_to_overwrite_name(self, mock_config_file):
        import_zip = os.path.join(resource_filename('gtmcore','workflows'),
                                  'tests', 'test_dataset.zip')
        dup_import = shutil.copy(import_zip, '/tmp/copy-of-test_dataset.zip')
        z = ZipExporter()
        x = z.import_dataset(dup_import, 'test', 'test')

        dup_import = shutil.copy(import_zip, '/tmp/copy-of-test_dataset.zip')
        # Now try to import that again and it should fail, cause a
        # project by that name already exists.
        with pytest.raises(ZipWorkflowException):
            y = z.import_dataset(dup_import, 'test', 'test')

    def test_success_export_then_import_different_users(self, mock_config_file):
        inv_manager = InventoryManager()
        ds = inv_manager.create_dataset('unittester', 'unittester', 'unittest-zip',
                                        'gigantum_object_v1')

        with tempfile.TemporaryDirectory() as tempd:
            path = ZipExporter.export_dataset(ds.root_dir, tempd)
            newds = ZipExporter.import_dataset(path, "unittester2", "unittester2")
            assert not os.path.exists(path)
            assert 'unittester2' == InventoryManager().query_owner(newds)
            assert newds.is_repo_clean
            assert newds.active_branch == 'master'

            # Now try with same user as exporter
            path2 = ZipExporter.export_dataset(ds.root_dir, tempd)
            shutil.rmtree(ds.root_dir)
            lb2 = ZipExporter.import_dataset(path2, "unittester", "unittester")
            assert 'unittester' == InventoryManager().query_owner(lb2)
            assert lb2.is_repo_clean
            assert lb2.active_branch == 'master'
