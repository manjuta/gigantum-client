from lmsrvcore.caching import LabbookCacheController

from gtmcore.fixtures import mock_labbook


class TestRepoCacheMiddleware:
    def test_correctness_via_cache(self, mock_labbook):
        """
        Test that caching works properly by ensuring that the actual value in the labbook
        matches the value when retrieved via the cache.
        """
        _, _, lb = mock_labbook
        username = 'test'
        r = LabbookCacheController()
        r.clear_entry((username, lb.owner, lb.name))
        assert lb.description == r.cached_description((username, lb.owner, lb.name))
        assert lb.creation_date.utctimetuple() == r.cached_created_time((username, lb.owner, lb.name)).utctimetuple()
        assert lb.modified_on.utctimetuple() == r.cached_modified_on((username, lb.owner, lb.name)).utctimetuple()

    def test_clear_cache(self, mock_labbook):
        """
        Test that the clear_entry method works properly and deletes the cache entry from Redis.
        """
        _, _, lb = mock_labbook
        username = 'test'
        r = LabbookCacheController()
        r.clear_entry((username, lb.owner, lb.name))

        # Retrieve the values and put them in the cache
        r.cached_description((username, lb.owner, lb.name))
        r.cached_created_time((username, lb.owner, lb.name))
        r.cached_modified_on((username, lb.owner, lb.name))

        assert r.db.exists(r._make_key((username, lb.owner, lb.name))) == 1

        r.clear_entry((username, lb.owner, lb.name))
        assert not r.db.hgetall(r._make_key((username, lb.owner, lb.name)))
        assert r.db.exists(r._make_key((username, lb.owner, lb.name))) == 0
