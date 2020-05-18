# Gigantum's mitmproxy

The repository of a man-in-the-middle reverse proxy that sits 
between the gtm client and project containers running rstudio-server
for now, but the strategy/tooling is general to any http tool.

The path to rstudio server is:

proxy-route -> mitmproxy(nginx):8079 -> mitmproxy(mitm):8080 -> project:8787

This container proxies all request and uses nginx to do URL re-writing before
handing off to the Man-In-The-Middle proxy to log http traffic (including
request payloads) to the a shared volume at /mnt/share

## Building

Given the simplicity of this container and the infrequent need to change things, we manually build the docker image and
push to the hub:

- `docker build -t gigantum/mitmproxy_proxy:tag .`
- `docker push gigantum/mitmproxy_proxy:tag`

You'll then update `CURRENT_MITMPROXY_TAG` in `gtmcore/mitmproxy/mitmproxy.py`.

The gigantum namespace on Docker Hub is controlled by Gigantum, Inc. If you use a different namespace, you'll need to
change the name in the relevant `run_container()` execution (in that same file).

## Contributing

Gigantum uses the [Developer Certificate of Origin](https://developercertificate.org/). 
This is lightweight approach that doesn't require submission and review of a
separate contributor agreement.  Code is signed directly by the developer using
facilities built into git.

Please see [`docs/contributing.md` in the gtm
repository](https://github.com/gigantum/gtm/tree/integration/docs/contributing.md).
