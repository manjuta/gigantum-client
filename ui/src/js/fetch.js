// vendor
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false,
});

function fetchQuery(apiURL) {
  const headers = {};
  headers.Accept = 'application/json';
  headers['Content-Type'] = 'application/json';
  headers['Access-Control-Allow-Origin'] = '*';

  return fetch(apiURL, {
    method: 'GET',
    headers: {
      ...headers,
      agent,
    },
  }).then(response => response.json())
    .catch(error => error);
}

export default fetchQuery;
