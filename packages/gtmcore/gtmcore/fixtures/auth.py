from typing import Tuple, Dict, Iterator

import json
import hashlib
import base64
import os
import shutil
import requests
from pkg_resources import resource_filename
import pytest
from jose import jwt
import datetime

from gtmcore.configuration.configuration import Configuration
from gtmcore.fixtures.fixtures import _create_temp_work_dir


def _setup_jwts(config_instance: Configuration) -> dict:
    # Insert JWK so it is just loaded from the cached location.
    jwk_path = resource_filename('gtmcore.fixtures', 'jwk.json')
    identity_dir = os.path.join(config_instance.app_workdir, '.labmanager', 'identity')
    os.makedirs(identity_dir)
    shutil.copyfile(jwk_path, os.path.join(identity_dir, 'test-gigantum-com-jwks.json'))

    # Create tokens
    pem_path = resource_filename('gtmcore.fixtures', 'test-signing-key.pem.dat')
    with open(pem_path, 'rt') as f:
        private_key_data = f.read()
    access_token_data = {
                          "iss": "https://auth.gigantum.com/",
                          "aud": [
                            "api.test.gigantum.com",
                            "https://gigantum.auth0.com/userinfo"
                          ],
                          "iat": int(datetime.datetime.utcnow().timestamp()),
                          "exp": int((datetime.datetime.utcnow() + datetime.timedelta(hours=24)).timestamp()),
                          "azp": "Z6Wl854wqCjNY0D4uJx8SyPyySyfKmAy",
                          "scope": "openid profile email"
                        }
    at = jwt.encode(access_token_data, private_key_data,
                    algorithm='RS256', headers={'kid': "813f0af16fcd4bdb933b2682f49f5612"})

    at_hash = hashlib.sha256()
    at_hash.update(at.encode())
    at_hash_encoded = base64.urlsafe_b64encode(at_hash.digest()[:16]).decode().replace("==", "")

    id_token_data = {
                      "given_name": "John",
                      "family_name": "Doe",
                      "nickname": "johndoe",
                      "email": "john.doe@gmail.com",
                      "email_verified": True,
                      "iss": "https://auth.gigantum.com/",
                      "aud": "Z6Wl854wqCjNY0D4uJx8SyPyySyfKmAy",
                      "iat": int(datetime.datetime.utcnow().timestamp()),
                      "exp": int((datetime.datetime.utcnow() + datetime.timedelta(hours=24)).timestamp()),
                      "at_hash": at_hash_encoded
                    }
    token_data = {"access_token": at,
                  "id_token": jwt.encode(id_token_data, private_key_data,
                                         algorithm='RS256', headers={'kid': "813f0af16fcd4bdb933b2682f49f5612"})}
    return token_data


@pytest.fixture()
def mock_config_file_with_auth() -> Iterator[Tuple[Configuration, Dict, str]]:
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test"""
    overrides = {
        'auth': {
            'identity_manager': 'local'
        }
    }

    config_instance, working_dir = _create_temp_work_dir(override_dict=overrides)

    token_data = _setup_jwts(config_instance)

    yield config_instance, token_data, working_dir
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_config_file_with_auth_first_login():
    """A pytest fixture that will run the first login workflow"""
    overrides = {
        'auth': {
            'identity_manager': 'local'
        },
        'core': {
            'import_demo_on_first_login': True
        }
    }

    config_instance, working_dir = _create_temp_work_dir(override_dict=overrides)

    token_data = _setup_jwts(config_instance)

    yield config_instance, token_data, working_dir
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_config_file_with_auth_browser():
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test"""
    overrides = {
        'auth': {
            'identity_manager': 'browser'
        }
    }

    config_instance, working_dir = _create_temp_work_dir(override_dict=overrides)

    token_data = _setup_jwts(config_instance)

    yield config_instance, token_data, working_dir
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_config_file_with_auth_anonymous():
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test"""
    overrides = {
        'auth': {
            'identity_manager': 'anonymous'
        }
    }

    config_instance, working_dir = _create_temp_work_dir(override_dict=overrides)

    token_data = _setup_jwts(config_instance)

    yield config_instance, token_data, working_dir
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_config_file_with_auth_anon_review():
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test"""
    overrides = {
        'auth': {
            'identity_manager': 'anon_review'
        },
        'anon_review_secret': '1234'
    }

    config_instance, working_dir = _create_temp_work_dir(override_dict=overrides)

    yield config_instance, working_dir
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_config_file_with_auth_multi_anon_review():
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test"""
    overrides = {
        'auth': {
            'identity_manager': 'anon_review'
        },
        'anon_review_secret': ['1234', '4567', 'abcd']
    }

    config_instance, working_dir = _create_temp_work_dir(override_dict=overrides)

    yield config_instance, working_dir
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)
