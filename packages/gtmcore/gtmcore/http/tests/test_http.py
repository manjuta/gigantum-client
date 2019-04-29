from gtmcore.http import AsyncHTTPRequestManager, AsyncGetJSON
import time


class TestAsyncHTTP(object):
    def test_get_200(self):
        request1 = AsyncGetJSON('https://jsonplaceholder.typicode.com/todos/1')
        arm = AsyncHTTPRequestManager()
        result = arm.resolve([request1])
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
        result = arm.resolve(request_list)
        t_stop = time.time()
        assert len(result) == 504

        print((t_stop - t_start))
        assert (t_stop - t_start) < 10

        for r in result:
            assert r.status_code == 200
            assert r.result_json == '200 OK'
