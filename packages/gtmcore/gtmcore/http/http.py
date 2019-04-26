from typing import Optional, Dict, Callable, Any, List
import aiohttp
import asyncio
import abc

from gtmcore.dataset.manifest.eventloop import get_event_loop


class AsyncURL(metaclass=abc.ABCMeta):
    def __init__(self, url: str, params: Optional[Dict[str, str]] = None,
                 extraction_function: Optional[Callable] = None, timeout: int = 60) -> None:
        self.url = url
        self.params = params
        self.timeout = timeout
        self.extraction_function = extraction_function

        # Results
        self.status_code: Optional[int] = None
        self.result_text: Optional[str] = None
        self.result_json: Optional[dict] = None

    @property
    def coroutine_method(self) -> str:
        raise NotImplemented

    @property
    def extracted_value(self) -> Any:
        raise NotImplemented


class AsyncGetJSON(AsyncURL):
    @property
    def coroutine_method(self) -> str:
        return 'json'

    @property
    def extracted_value(self) -> Any:
        if not self.extraction_function:
            raise ValueError("Extraction Function not set. Only full response data access possible.")
        return self.extraction_function(self.result_json)


class AsyncRequestManager(object):
    def __init__(self, timeout: int = 60, semaphore_limit: int = 1000) -> None:
        self.timeout = timeout
        self._client_session = None
        self.semaphore = asyncio.Semaphore(semaphore_limit)

    @property
    def session(self) -> aiohttp.ClientSession:
        if not self._client_session:
            self._client_session = aiohttp.ClientSession()
        return self._client_session

    async def fetch(self, url_obj: AsyncURL) -> AsyncURL:
        async with self.session.get(url_obj.url, params=url_obj.params) as response:
            url_obj.status_code = response.status
            if url_obj.coroutine_method == "json":
                url_obj.result_text = await response.json()
            elif url_obj.coroutine_method == "text":
                url_obj.result_json = await response.json()
            else:
                raise ValueError(f"Unsupported coroutine method to access response data: {url_obj.coroutine_method}. "
                                 f"Use 'json' or 'text'.")

        return url_obj

    async def bound_fetch(self, url_obj: AsyncURL) -> AsyncURL:
        async with self.semaphore:
            return await self.fetch(url_obj)

    async def resolve_worker(self, url_objs: List[AsyncURL]) -> List[AsyncURL]:
        tasks = list()
        for url_obj in url_objs:
            task = asyncio.ensure_future(self.bound_fetch(url_obj))
            tasks.append(task)

        responses = asyncio.gather(*tasks)
        return await responses

    def resolve(self, url_objs: List[AsyncURL]) -> List[AsyncURL]:
        loop = get_event_loop()
        future = asyncio.ensure_future(self.resolve_worker(url_objs))
        result = loop.run_until_complete(future)
        return result
