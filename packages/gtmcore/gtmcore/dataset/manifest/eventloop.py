import asyncio


def get_event_loop():
    # Temporary helper method to configure an event loop inside Flask. Can be removed once using an asyncio compatible
    # framework
    try:
        # XXX pretty sure this was wrong for py3.7? AND this basically re-implements asyncio.get_event_loop() -DJWC
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop
