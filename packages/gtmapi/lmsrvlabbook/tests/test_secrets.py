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


class TestSecretsVaultQueries:
    def test_secrets_vault_query(self, fixture_working_dir_env_repo_scoped):
        client = fixture_working_dir_env_repo_scoped[2]
        im = InventoryManager(fixture_working_dir_env_repo_scoped[0])
        lb = im.create_labbook("default", "default", "labbook6")
        sec_store = SecretStore(lb, "default")
        sec_store['sample_vault_1'] = '/tmp/secrets1'
        sec_store['sample_vault_2'] = '/tmp/secrets2'

        with tempfile.TemporaryDirectory() as tdir:
            path = os.path.join(tdir, 'data1.key')
            f1 = open(path, 'w')
            f1.write('keydata')
            f1.close()
            sec_store.insert_file(f1.name, 'sample_vault_1')

        query = """
        {
            labbook(owner: "default", name: "labbook6") {
                environment {
                    secretsVault {
                        edges {
                            node {
                                vaultName
                                secretsFiles
                                mountPath
                            }
                        }
                    }
                }
            }
        }
        """
        r = client.execute(query)
        assert 'errors' not in r
        assert r['data']['labbook']['environment']['secretsVault']['edges'][0]['node']['vaultName'] == 'sample_vault_1'
        assert r['data']['labbook']['environment']['secretsVault']['edges'][0]['node']['secretsFiles'] == ['data1.key']
        assert r['data']['labbook']['environment']['secretsVault']['edges'][0]['node']['mountPath'] == '/tmp/secrets1'
        assert r['data']['labbook']['environment']['secretsVault']['edges'][1]['node']['vaultName'] == 'sample_vault_2'
        assert r['data']['labbook']['environment']['secretsVault']['edges'][1]['node']['secretsFiles'] == []
        assert r['data']['labbook']['environment']['secretsVault']['edges'][1]['node']['mountPath'] == '/tmp/secrets2'


class TestSecretsVaultMutations:
    def test_basic_create_remove_secrets_vault(self, fixture_working_dir_env_repo_scoped):
        """
        Tests the loop of creating and removing an empty secret vault
        """
        client = fixture_working_dir_env_repo_scoped[2]
        im = InventoryManager(fixture_working_dir_env_repo_scoped[0])
        lb = im.create_labbook("default", "default", "unittest-create-secret")

        create_query = """
        mutation makeSecVault {
            createSecretVault(input: {
                owner: "default",
                labbookName: "unittest-create-secret",
                vaultName: "example-vault",
                mountDir: "/var/samplekeys"
            }) {
                environment {
                    secretsVault {
                        edges {
                            node {
                                vaultName
                                secretsFiles
                                mountPath
                            }
                        }
                    }
                }
            }
        }
        """
        r = client.execute(create_query)
        pprint.pprint(r)
        assert 'errors' not in r
        assert r['data']['createSecretVault']['environment']['secretsVault']['edges'][0]['node']['vaultName'] == 'example-vault'
        assert r['data']['createSecretVault']['environment']['secretsVault']['edges'][0]['node']['secretsFiles'] == []
        assert r['data']['createSecretVault']['environment']['secretsVault']['edges'][0]['node']['mountPath'] == '/var/samplekeys'

        remove_query = """
        mutation rmSecVault {
            removeSecretVault(input: {
                owner: "default",
                labbookName: "unittest-create-secret",
                vaultName: "example-vault"
            }) {
                environment {
                    secretsVault {
                        edges {
                            node {
                                vaultName
                                secretsFiles
                                mountPath
                            }
                        }
                    }
                }
            }
        }
        """
        remove_response = client.execute(remove_query)
        pprint.pprint(remove_response)
        assert 'errors' not in remove_response
        assert not remove_response['data']['removeSecretVault']['environment']['secretsVault']['edges']

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
                    vaultName: "upload-vault",
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
                        secretsVault {{
                            edges {{
                                node {{
                                    vaultName
                                    secretsFiles
                                    mountPath
                                }}
                            }}
                        }}
                    }}
                }}
            }}"""

            file = FileStorage(chunk)
            r = client.execute(upload_query, context_value=DummyContext(file))
        secret_info = r['data']['insertSecretsFile']['environment']['secretsVault']['edges'][0]['node']
        assert secret_info['vaultName'] == 'upload-vault'
        assert secret_info['secretsFiles'] == ['id_rsa']
        assert secret_info['mountPath'] == '/opt/secrets/location/in/container'

        # Test that the uploaded file hash exactly matches that as the one in the "vault"
        d = secret_store.as_mount_dict
        uploaded_hash = hashlib.md5(open(f'{list(d.keys())[0]}/id_rsa', 'rb').read()).hexdigest()
        assert initial_hash == uploaded_hash
