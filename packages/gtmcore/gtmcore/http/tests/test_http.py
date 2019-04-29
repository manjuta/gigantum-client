from gtmcore.http import AsyncHTTPRequestManager, AsyncGetJSON


class TestAsyncHTTP(object):
    def test_get_200(self):
        request1 = AsyncGetJSON("https://httpstat.us/200?sleep=100")
        arm = AsyncHTTPRequestManager()
        result = arm.resolve([request1])

        assert isinstance(sb, GigantumObjectStore)
