# FRONTEND BUILD CONTAINER
FROM ubuntu:18.04 as ui-builder
MAINTAINER Gigantum <support@gigantum.com>

# Install system level dependencies
RUN apt-get -y update && apt-get -y install git curl gosu nodejs npm

# Install Yarn
RUN npm install yarn --global

# Install babel-node
RUN npm install -g babel-cli@6.26.0 jest@21.2.1 relay-compiler@1.6.0 webpack@3.3.0 jsdom-global@3.0.2 jsdom@>=10.0.0

# Make build location dir
RUN mkdir /opt/ui

# Set the react port to match nginx
ENV PORT "10001"

# Copy source to build
COPY ui /opt/ui
COPY resources/docker/ui_build_script.sh /opt/ui_build_script.sh
RUN /bin/bash /opt/ui_build_script.sh


# PRODUCTION CONTAINER
FROM ubuntu:18.04
LABEL maintainer="Gigantum <support@gigantum.com>"

# Copy requirements files
COPY packages/gtmcore/requirements.txt /opt/gtmcore/requirements.txt
COPY packages/gtmapi/requirements.txt /opt/gtmapi/requirements.txt
COPY packages/confhttpproxy /opt/confhttpproxy
ENV SHELL=/bin/bash

# Super instruction to install all dependencies
RUN apt-get -y update && \
    apt-get -y --no-install-recommends install git nginx supervisor wget openssl python3 python3-pip python3-distutils \
    gcc g++ gosu redis-server libjpeg-dev git-lfs python3-setuptools python3-dev libdpkg-perl zip unzip && \
    git lfs install && \
    apt-get -y install curl gnupg gnupg1 gnupg2 && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash && \
    apt-get -y install nodejs && \
    npm install -g configurable-http-proxy && \
    cd /opt/confhttpproxy && pip3 install -e . && \
    pip3 install wheel && \
    pip3 install -r /opt/gtmcore/requirements.txt && \
    pip3 install -r /opt/gtmapi/requirements.txt && \
    pip3 install uwsgi && \
    apt-get -qq -y remove gcc g++ python3-dev wget curl gnupg gnupg1 gnupg2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /var/log/dpkg.log

# Arguments, defaulted to production values
ARG CLIENT_CONFIG_FILE=build/client/labmanager-config.yaml
ARG NGINX_UI_CONFIG=resources/client/nginx_ui.conf
ARG NGINX_API_CONFIG=resources/client/nginx_api.conf
ARG SUPERVISOR_CONFIG=build/client/supervisord.conf
ARG ENTRYPOINT_FILE=resources/client/entrypoint.sh

# Copy Libraries
# TODO: Make pip installs once refactor is completed
COPY packages/gtmapi /opt/gtmapi
COPY packages/gtmcore /opt/gtmcore

RUN cd /opt/gtmcore/ && python3 setup.py install

# Setup lmcommon config file - should be written by automation before copy
COPY $CLIENT_CONFIG_FILE /etc/gigantum/labmanager.yaml

# Setup logging config file
COPY packages/gtmcore/gtmcore/logging/logging.json.default /etc/gigantum/logging.json

# Make needed directories
RUN mkdir -p /mnt/gigantum && mkdir /opt/redis

# Copy frontend
COPY --from=ui-builder /opt/ui/build /var/www/

# Setup NGINX/uWSGI
COPY $NGINX_UI_CONFIG /etc/nginx/sites-enabled/
COPY $NGINX_API_CONFIG /etc/nginx/sites-enabled/
RUN rm /etc/nginx/sites-enabled/default

# Setup Redis
COPY resources/client/redis.conf /opt/redis/redis.conf

# Setup Supervisord to launch both uwsgi and nginx
RUN mkdir -p /opt/log/supervisor && mkdir -p /opt/log/nginx && mkdir -p /opt/run && \
    mkdir -p /opt/nginx && nginx && nginx -s reload && nginx -s quit
COPY resources/client/supervisord_base.conf /etc/supervisor/supervisord.conf
COPY $SUPERVISOR_CONFIG /etc/supervisor/conf.d/supervisord.conf

COPY $ENTRYPOINT_FILE /usr/local/bin/entrypoint.sh
RUN chmod u+x /usr/local/bin/entrypoint.sh

# Setup demo labbook
COPY resources/awful-intersections-demo.lbk /opt/awful-intersections-demo.lbk

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Expose Ports
EXPOSE 10000 10001 10002

# Start by firing up uwsgi, nginx, redis, and workers via supervisord
CMD ["/usr/bin/supervisord", "--nodaemon"]