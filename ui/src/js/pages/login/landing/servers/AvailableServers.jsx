// @flow
// vendors
import React from 'react';
// components
import Server from './server/Server';
// css
import './AvailableServers.scss';

type Props = {
  auth: Object,
  availableServers: Array,
}

const AvailablesServers = (props: Props) => {
  const {
    auth,
    availableServers,
  } = props;
  return (
    <section className="AvailablesServers">
      <h4 className="AvailablesServers__h4">Select a Server</h4>

      <br />
      { availableServers.map(server => (
        <Server
          auth={auth}
          key={server.server_id}
          server={server}
        />
      ))}

      <br />

      <div>
        <a
          href="https://docs.gigantum.com/docs/adding-self-hosted-servers"
          rel="noopener noreferrer"
          target="_blank"
        >
          How to add a self-managed server
        </a>
      </div>
    </section>
  );
};

export default AvailablesServers;
