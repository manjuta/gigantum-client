#!/bin/bash

echo "Installing Honeytail..."
wget -q https://honeycomb.io/download/honeytail/linux/honeytail_1.762_amd64.deb && \
      echo 'd7bed8a005cbc6a34b232c54f0f84b945f0bb90905c67f85cceaedee9bbbad1e  honeytail_1.762_amd64.deb' | sha256sum -c && \
      dpkg -i honeytail_1.762_amd64.deb && echo "Installation complete."
