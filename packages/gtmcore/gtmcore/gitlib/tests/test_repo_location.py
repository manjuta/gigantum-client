import pytest
from gtmcore.fixtures import mock_config_file
from gtmcore.gitlib import RepoLocation


def test_url_translations(mock_config_file):
    """This should be kept current as a list of expected outputs from normal inputs"""
    expected_formatting = [
        # Leave canonical paths alone
        ('https://test.repo.gigantum.com/owner/project.git/',
         'https://username@test.repo.gigantum.com/owner/project.git/'),
        # "rewrite" user facing URLs
        ('https://test.gigantum.com/owner/project',
         'https://username@test.repo.gigantum.com/owner/project.git/'),
        ('https://test.gigantum.com/owner/project/',
         'https://username@test.repo.gigantum.com/owner/project.git/'),
        # Add trailing slash
        ('https://test.repo.gigantum.com/owner/project.git',
         'https://username@test.repo.gigantum.com/owner/project.git/'),
        # Always match protocol of configured server
        ('http://test.repo.gigantum.com/owner/project.git',
         'https://username@test.repo.gigantum.com/owner/project.git/'),
        # Add trailing .git/
        ('https://test.repo.gigantum.com/owner/project',
         'https://username@test.repo.gigantum.com/owner/project.git/'),
        # Existing username overwritten
        ('https://othername@test.repo.gigantum.com/owner/project',
         'https://username@test.repo.gigantum.com/owner/project.git/'),
        ('/a/unix/path', '/a/unix/path'),
        # \ -> /, trailing slash stripped
        (r'\a\windows\path\\', '/a/windows/path'),
        # Trailing slash is stripped, no initial slash preserved
        ('a/unix/path/', 'a/unix/path'),
    ]

    for in_url, output in expected_formatting:
        remote = RepoLocation(in_url, 'username')
        assert remote.remote_location == output

    # We can also get rid of the username
    in_url = 'https://othername@test.repo.gigantum.com/owner/project'
    remote = RepoLocation(in_url, None)
    assert remote.remote_location == 'https://test.repo.gigantum.com/owner/project.git/'


def test_url_translations_invalid_domain(mock_config_file):
    with pytest.raises(ValueError):
        RepoLocation('https://wrong.domain.com/owner/project', 'username')


def test_field_parsing(mock_config_file):
    """We test OTHER fields besides remote_location (already tested extensively above)"""
    expected_fields = [
        # Leave canonical paths alone
        ('https://otheruser@test.repo.gigantum.com/owner/project.git/',
         {'owner_repo': 'owner/project',
          'base_path': '/owner/project',
          'host': 'test.repo.gigantum.com',
          # Note - different than initial URL
          'netloc': 'username@test.repo.gigantum.com',
          'owner': 'owner',
          'repo_name': 'project',
          }),
        ('/a/unix/path',
         {'owner_repo': 'unix/path',
          'base_path': '/a/unix/path',
          # Probably the oddest part of the API
          'host': '/a/unix/path',
          'netloc': '',
          'owner': 'unix',
          'repo_name': 'path',
          })
    ]

    for in_url, fields in expected_fields:
        remote = RepoLocation(in_url, 'username')
        for key, value in fields.items():
            assert getattr(remote, key) == value
