import os
import tempfile
import pprint

from gtmcore.inventory.inventory import InventoryManager
from gtmcore.labbook import SecretStore

from lmsrvlabbook.tests.fixtures import fixture_working_dir_env_repo_scoped


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
