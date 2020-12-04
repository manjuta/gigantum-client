import '../src/css/critical.scss';

import { configure } from '@storybook/react';

const req = require.context('../src/js', true, /\.stories\.js$/); // <- import all the stories at once

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
