from gtmcore.http import AsyncHTTPRequestManager, AsyncGetJSON
import time
import pytest
import asyncio


class TestAsyncHTTP(object):
    def test_resolve_many_200(self):
        request1 = AsyncGetJSON('https://jsonplaceholder.typicode.com/todos/1')
        arm = AsyncHTTPRequestManager()
        result = arm.resolve_many([request1])
        assert isinstance(result, list)
        assert isinstance(result[0], AsyncGetJSON)
        assert 'userId' in result[0].result_json

    def test_get_many(self):
        request_list = list()
        for _ in range(500):
            request_list.append(AsyncGetJSON("https://httpstat.us/200?sleep=100"))

        request_list.append(AsyncGetJSON("https://httpstat.us/200?sleep=5000"))
        request_list.append(AsyncGetJSON("https://httpstat.us/200?sleep=5000"))
        request_list.append(AsyncGetJSON("https://httpstat.us/200?sleep=5000"))
        request_list.append(AsyncGetJSON("https://httpstat.us/200?sleep=5000"))

        t_start = time.time()
        arm = AsyncHTTPRequestManager()
        result = arm.resolve_many(request_list)
        t_stop = time.time()
        assert len(result) == 504

        print((t_stop - t_start))
        assert (t_stop - t_start) < 10

        for r in result:
            assert r.status_code == 200
            assert r.result_json == '200 OK'

    def test_resolve_200(self):
        request1 = AsyncGetJSON('https://jsonplaceholder.typicode.com/todos/1')
        arm = AsyncHTTPRequestManager()
        result = arm.resolve(request1)
        assert isinstance(result, AsyncGetJSON)
        assert 'userId' in result.result_json

    def test_error(self):
        req = AsyncGetJSON("https://httpstat.us/404?sleep=100")
        arm = AsyncHTTPRequestManager()
        result = arm.resolve(req)
        assert result.status_code == 404
        assert result.result_json == '404 Not Found'

    def test_resolve_extraction(self):
        def test_extractor(data):
            return data['userId']

        request1 = AsyncGetJSON('https://jsonplaceholder.typicode.com/todos/2', extraction_function=test_extractor)
        arm = AsyncHTTPRequestManager()
        result = arm.resolve(request1)
        assert result.extracted_value == 1

    def test_timeout(self):
        req = AsyncGetJSON("https://httpstat.us/200?sleep=10000", timeout=1)
        arm = AsyncHTTPRequestManager()
        with pytest.raises(asyncio.TimeoutError):
            arm.resolve(req)
