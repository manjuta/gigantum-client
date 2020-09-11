from gtmcore.logging import LMLogger

logger = LMLogger.get_logger()


def error_middleware(next, root, info, **args):
    """Middleware function to log all exceptions"""
    try:
        return_value = next(root, info, **args)
    except Exception as e:
        logger.exception(e)
        raise

    return return_value
