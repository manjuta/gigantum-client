import os
import tempfile
import pprint

from gtmcore.inventory.inventory import InventoryManager
from gtmcore.labbook import SecretStore

from lmsrvlabbook.tests.fixtures import fixture_working_dir_env_repo_scoped


class TestSecretsVault(object):
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
        pprint.pprint(r)
        assert False
