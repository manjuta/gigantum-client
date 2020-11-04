from gtmcore.logging import LMLogger
from time import time as timer
import json

logger = LMLogger.get_logger()


def time_all_resolvers_middleware(next, root, info, **args):
    """Middleware to time and log all resolvers"""
    start = timer()
    return_value = next(root, info, **args)
    duration = timer() - start

    data = {"metric_type": "field_resolver_duration",
            "parent_type": root._meta.name if root and hasattr(root, '_meta') else '',
            "field_name": info.field_name,
            "duration_ms": round(duration * 1000, 2)}

    if duration * 1000 > 10:
        logger.info(f"METRIC :: {json.dumps(data)}")
    return return_value
