// // vendor
// import React from 'react';
// import { QueryRenderer, graphql } from 'react-relay';
// // environment
// import environment from 'JS/createRelayEnvironment';
// // components
// import Loader from 'Components/loader/Loader';
// import AvailableServers from './AvailableServers';

// const AvailableServersWrapperQuery = graphql`
// query AvailableServersWrapperQuery {
//   currentServer {
//     id
//     serverId
//     name
//     gitUrl
//     gitServerType
//     hubApiUrl
//     objectServiceUrl
//     userSearchUrl
//     lfsEnabled
//     authConfig {
//       id
//       serverId
//       loginType
//       loginUrl
//       audience
//       issuer
//       signingAlgorithm
//       publicKeyUrl
//       typeSpecificFields {
//         id
//         serverId
//         parameter
//         value
//       }
//     }
//   }
// }`;

// type Props = {
//   auth: Object,
//   availableServers: Array,
// }

// const AvailableServersWrapper = ({ auth, availableServers }) => (
//   <QueryRenderer
//     environment={environment}
//     query={AvailableServersWrapperQuery}
//     variables={{}}
//     render={({ props }) => {
//       console.log(props);
//       if (props) {
//         return (
//           <AvailableServers
//             {...props}
//             availableServers={availableServers || []}
//             auth={auth}
//           />
//         );
//       }

//       return <Loader />;
//     }}
//   />
// );

// export default AvailableServersWrapper;
