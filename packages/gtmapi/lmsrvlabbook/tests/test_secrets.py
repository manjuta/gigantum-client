import os
import io
import tempfile
import pprint
import math
import hashlib

import pytest
from werkzeug.datastructures import FileStorage
from graphene.test import Client

from gtmcore.inventory.inventory import InventoryManager
from gtmcore.labbook import SecretStore

from lmsrvcore.middleware import DataloaderMiddleware
from lmsrvlabbook.tests.fixtures import (fixture_working_dir_env_repo_scoped, fixture_working_dir)


@pytest.fixture()
def mock_config():
    pass


@pytest.fixture()
def mock_upload_key():
    with tempfile.TemporaryDirectory() as tempdir:
        # Make an approx 10MB key file, in order to test file uploadings
        # in multiple "chunks"
        with open(os.path.join(tempdir, 'id_rsa'), 'w') as f:
            f.write(f'---BEGIN---\n{"12345ABCDE" * 1000000}\n---END---\n')
        yield f


class TestSecretsQueries:
    def test_secrets_vault_query(self, fixture_working_dir_env_repo_scoped):
        client = fixture_working_dir_env_repo_scoped[2]
        im = InventoryManager(fixture_working_dir_env_repo_scoped[0])
        lb = im.create_labbook("default", "default", "unittest-create-secret")
        sec_store = SecretStore(lb, "default")
        container_dst = '/tmp/secrets1'

        with tempfile.TemporaryDirectory() as tdir:
            path = os.path.join(tdir, 'data1.key')
            f1 = open(path, 'w')
            f1.write('<<<keydata>>>')
            f1.close()
            sec_store.insert_file(f1.name, container_dst)

        query = """
        {
            labbook(owner: "default", name: "unittest-create-secret") {
                environment {
                    secretsFileMapping {
                        edges {
                            node {
                                filename
                                mountPath
                            }
                        }
                    }
                }
            }
        }
        """
        r = client.execute(query)
        pprint.pprint(r)
        assert 'errors' not in r
        assert r['data']['labbook']['environment']['secretsFileMapping']['edges'][0]['node']['filename'] == 'data1.key'
        assert r['data']['labbook']['environment']['secretsFileMapping']['edges'][0]['node']['mountPath'] == container_dst


class TestSecretsMutations:
    def test_upload_secrets_file(self, fixture_working_dir, mock_upload_key):

        class DummyContext(object):
            def __init__(self, file_handle):
                self.labbook_loader = None
                self.files = {'uploadChunk': file_handle}

        client = Client(fixture_working_dir[3], middleware=[DataloaderMiddleware()])

        im = InventoryManager(fixture_working_dir[0])
        lb = im.create_labbook("default", "default", "unittest-upload-secret")
        secret_store = SecretStore(lb, "default")
        secret_store['upload-vault'] = '/opt/secrets/location/in/container'
        initial_hash = hashlib.md5(open(mock_upload_key.name, 'rb').read()).hexdigest()

        new_file_size = os.path.getsize(mock_upload_key.name)
        # Get upload params
        chunk_size = 4194000
        file_info = os.stat(mock_upload_key.name)
        file_size = int(file_info.st_size / 1000)
        total_chunks = int(math.ceil(file_info.st_size / chunk_size))

        mf = open(mock_upload_key.name)
        for chunk_index in range(total_chunks):
            chunk = io.BytesIO()
            chunk.write(mf.read(chunk_size).encode())
            chunk.seek(0)
            print(f'Uploading chunk {chunk_index+1} / {total_chunks}')
            upload_query = f"""
            mutation upload {{
                insertSecretsFile(input: {{
                    owner: "default",
                    labbookName: "unittest-upload-secret",
                    mountPath: "/sample/path/in/container",
                    transactionId: "unittest-txid-9999",
                    chunkUploadParams: {{
                        uploadId: "rando-upload-id-1234",
                        chunkSize: {chunk_size},
                        totalChunks: {total_chunks},
                        chunkIndex: {chunk_index},
                        fileSizeKb: {file_size},
                        filename: "{os.path.basename(mock_upload_key.name)}"
                    }}
                }}) {{
                    environment {{
                        secretsFileMapping {{
                            edges {{
                                node {{
                                    filename
                                    mountPath
                                }}
                            }}
                        }}
                    }}
                }}
            }}"""

            file = FileStorage(chunk)
            r = client.execute(upload_query, context_value=DummyContext(file))
            pprint.pprint(r)
        secret_info = r['data']['insertSecretsFile']['environment']['secretsFileMapping']['edges'][0]['node']
        assert secret_info['filename'] == 'id_rsa'
        assert secret_info['mountPath'] == '/sample/path/in/container'

        # Test that the uploaded file hash exactly matches that as the one in the "vault"
        d = secret_store.as_mount_dict
        uploaded_hash = hashlib.md5(open(f'{list(d.keys())[0]}', 'rb').read()).hexdigest()
        assert initial_hash == uploaded_hash

    def test_remove_secret_file_exists(self, fixture_working_dir_env_repo_scoped, mock_upload_key):
        client = fixture_working_dir_env_repo_scoped[2]
        im = InventoryManager(fixture_working_dir_env_repo_scoped[0])
        lb = im.create_labbook("default", "default", "unittest-delete-secret")
        sec_store = SecretStore(lb, "default")
        container_dst = '/opt/dir-for-secret-to-delete'

        with tempfile.TemporaryDirectory() as tdir:
            path = os.path.join(tdir, 'key-to-delete.key')
            f1 = open(path, 'w')
            f1.write('<<<keydata>>>')
            f1.close()
            sec_store.insert_file(f1.name, container_dst)

        delete_query = """
        mutation removeSec {
            removeSecretsFile(input: {
                owner: "default",
                labbookName: "unittest-delete-secret",
                keyFilename: "key-to-delete.key"
            }) {
                environment {
                    secretsFileMapping {
                        edges {
                            node {
                                filename
                                mountPath
                            }
                        }
                    }
                }
            }
        }
        """
        r = client.execute(delete_query)
        assert 'errors' not in r
        assert len(r['data']['removeSecretsFile']['environment']['secretsFileMapping']['edges']) == 0
        assert len(sec_store.list_files()) == 0
        assert len(sec_store.as_mount_dict) == 0

    def test_remove_secret_file_not_exists(self, fixture_working_dir_env_repo_scoped, mock_upload_key):
        client = fixture_working_dir_env_repo_scoped[2]
        im = InventoryManager(fixture_working_dir_env_repo_scoped[0])
        lb = im.create_labbook("default", "default", "unittest-delete-secret-fail")
        sec_store = SecretStore(lb, "default")
        container_dst = '/opt/dir-for-secret-to-delete'

        with tempfile.TemporaryDirectory() as tdir:
            path = os.path.join(tdir, 'key-to-delete.key')
            f1 = open(path, 'w')
            f1.write('<<<keydata>>>')
            f1.close()
            sec_store.insert_file(f1.name, container_dst)

        delete_query = """
        mutation removeSec {
            removeSecretsFile(input: {
                owner: "default",
                labbookName: "unittest-delete-secret-fail",
                keyFilename: "does-not-exist.key"
            }) {
                environment {
                    secretsFileMapping {
                        edges {
                            node {
                                filename
                                mountPath
                            }
                        }
                    }
                }
            }
        }
        """
        r = client.execute(delete_query)
        assert 'errors' in r
        # Ensure the file already in there still exists
        assert len(sec_store.list_files()) == 1
        assert len(sec_store.as_mount_dict) == 1
