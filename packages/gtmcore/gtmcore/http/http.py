from typing import Optional, Dict, Callable, Any, List
import aiohttp
import asyncio
import abc

from gtmcore.dataset.manifest.eventloop import get_event_loop


class AsyncURL(metaclass=abc.ABCMeta):
    """Abstract class for a URL to be resolved asynchronously"""
    def __init__(self, url: str, params: Optional[Dict[str, str]] = None,
                 extraction_function: Optional[Callable] = None, timeout: int = 60) -> None:
        self.url = url
        self.params = params
        self.timeout = timeout

        # Set this to a function you want called to process the response and set the extracted_value
        self.extraction_function = extraction_function

        # Results
        self.status_code: Optional[int] = None
        self.result_text: Optional[str] = None
        self.result_json: Optional[dict] = None

    @property
    def coroutine_method(self) -> str:
        """Property indicating what co-routine method should run to extract data from the request: text, json, raw

        Returns:
            str
        """
        raise NotImplemented

    @property
    def headers(self) -> dict:
        """Property if any headers are needed

        Returns:

        """
        raise NotImplemented

    @property
    def extracted_value(self) -> Any:
        """Property that is set if extraction of a value from the response is configured"""
        raise NotImplemented


class AsyncGetJSON(AsyncURL):
    """JSON GET"""
    @property
    def coroutine_method(self) -> str:
        return 'json'

    @property
    def headers(self) -> dict:
        return {'accept': 'application/json'}

    @property
    def extracted_value(self) -> Any:
        """If self.extraction_function is set to a function, calling this attribute will process the data for you"""
        if not self.extraction_function:
            raise ValueError("Extraction Function not set. Only full response data access possible.")
        return self.extraction_function(self.result_json)


class AsyncHTTPRequestManager(object):
    """Class to manage processing async requests"""
    def __init__(self, timeout: int = 60, semaphore_limit: int = 1000) -> None:
        self.timeout = timeout
        self._client_session = None
        self.semaphore = asyncio.Semaphore(semaphore_limit)

    @property
    def session(self) -> aiohttp.ClientSession:
        """Property to get a sesssion. Only one should exist at a time, so keep returning the same session.

        Returns:

        """
        if not self._client_session:
            self._client_session = aiohttp.ClientSession()
        return self._client_session

    async def _fetch(self, url_obj: AsyncURL) -> AsyncURL:
        """Private method to resolve a URL and parse it.

        Args:
            url_obj: AsyncURL object to get and resolve

        Returns:
            AsyncURL
        """
        async with self.session.get(url_obj.url, params=url_obj.params,
                                    headers=url_obj.headers, timeout=url_obj.timeout) as response:
            url_obj.status_code = response.status
            if url_obj.coroutine_method == "json":
                url_obj.result_json = await response.json()
            elif url_obj.coroutine_method == "text":
                url_obj.result_text = await response.text()
            else:
                raise ValueError(f"Unsupported coroutine method to access response data: {url_obj.coroutine_method}. "
                                 f"Use 'json' or 'text'.")

        return url_obj

    async def _bound_fetch(self, url_obj: AsyncURL) -> AsyncURL:
        """Wrapper to limit concurrency"""
        async with self.semaphore:
            return await self._fetch(url_obj)

    async def _resolve_worker(self, url_objs: List[AsyncURL]) -> List[AsyncURL]:
        """Method to gather all resolve tasks"""
        tasks = list()
        for url_obj in url_objs:
            task = asyncio.ensure_future(self._bound_fetch(url_obj))
            tasks.append(task)

        responses = asyncio.gather(*tasks)
        return await responses

    def resolve(self, url_obj: AsyncURL) -> AsyncURL:
        """Method to resolve a single AsyncURL object

        Args:
            url_obj(AsyncURL): AsyncURL object to resolve

        Returns:
            AsyncURL
        """
        loop = get_event_loop()
        future = asyncio.ensure_future(self._resolve_worker([url_obj]))
        result = loop.run_until_complete(future)
        return result[0]

    def resolve_many(self, url_objs: List[AsyncURL]) -> List[AsyncURL]:
        """Method to resolve a many AsyncURL objects

        Args:
            url_objs(list): AsyncURL object to resolve

        Returns:
            list
        """
        loop = get_event_loop()
        future = asyncio.ensure_future(self._resolve_worker(url_objs))
        result = loop.run_until_complete(future)
        return result
