import time
from lmcommon.logging import LMLogger

logger = LMLogger.get_logger()

# If an API operations takes longer than this amount of time, log as WARNING rather than DEBUG.
WARNING_ELAPSED_THRESHOLD_MS = 1000


def logged_query(method_ref):  # type: ignore
    """Definition of decorator that validates git operations.

    Note! The approach here is taken from Stack Overflow answer https://stackoverflow.com/a/1263782
    """
    def __f(self, *args, **kwargs):
        start_time = time.time()
        try:
            logger.debug(f"Starting query {str(method_ref)}")
            n = method_ref(self, *args, **kwargs)  # type: ignore
            elapsed_time_ms = int((time.time() - start_time) * 1000)
            m = logger.warning if elapsed_time_ms >= WARNING_ELAPSED_THRESHOLD_MS else logger.debug
            m(f"Finished query {str(method_ref)} in {elapsed_time_ms}ms")
            return n
        except Exception as e:
            error_time_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Caught {type(e)} in {str(method_ref)} after {error_time_ms}ms: {e}")
            logger.exception(e)
            raise
    return __f


def logged_mutation(method_ref):  # type: ignore
    """Definition of decorator that validates git operations.

    Note! The approach here is taken from Stack Overflow answer https://stackoverflow.com/a/1263782
    """
    def __f(self, *args, **kwargs):
        start_time = time.time()
        try:
            logger.debug(f"Starting mutation {str(method_ref)}")
            n = method_ref(self, *args, **kwargs)  # type: ignore
            elapsed_time_ms = int((time.time() - start_time) * 1000)
            m = logger.warning if elapsed_time_ms >= WARNING_ELAPSED_THRESHOLD_MS else logger.debug
            m(f"Finished mutation {str(method_ref)} in {elapsed_time_ms}ms")
            return n
        except Exception as e:
            error_time_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Caught {type(e)} in {str(method_ref)} after {error_time_ms}ms: {e}")
            logger.exception(e)
            raise
    return __f
