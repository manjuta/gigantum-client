// @flow
// vendors
import React, { Component } from 'react';
// components
import Server from './server/Server';
// css
import './AvailableServers.scss';

type Props = {
  auth: Object,
  availableServers: Array,
}

type State = {
  loggingInServerId: null,
}

class AvailablesServers extends Component<Props, State> {
  state = {
    loggingInServerId: null,
  }

  /**
  * @param
  *
  */
  setLoggingInServerId = (serverId) => {
    this.setState({ loggingInServerId: serverId });
  }

  render() {
    const {
      auth,
      availableServers,
    } = this.props;
    const { loggingInServerId } = this.state;

    return (
      <section className="AvailablesServers">
        <h4 className="AvailablesServers__h4">Select a Server</h4>

        <br />
        { availableServers.map(server => (
          <Server
            auth={auth}
            key={server.server_id}
            loggingInServerId={loggingInServerId}
            server={server}
            setLoggingInServerId={this.setLoggingInServerId}
          />
        ))}

        <br />

        <div>
          <a
            href="https://docs.gigantum.com/docs/adding-a-server-to-gigantum-client"
            rel="noopener noreferrer"
            target="_blank"
          >
            How do I add a self-hosted server?
          </a>
        </div>
      </section>
    );
  }
}

export default AvailablesServers;
