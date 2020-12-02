import { addDecorator, addParameters } from '@storybook/react';
import { withTests } from '@storybook/addon-jest';
import { withConsole } from '@storybook/addon-console';

import results from 'Results/.jest-testresults.json';

addDecorator(
  withTests({
    results,
    filesExt: ".test.js",
  }),
);

addDecorator((storyFn, context) => withConsole()(storyFn)(context));

addParameters({
  options: {
    storySort: (a, b) =>
      a[1].kind === b[1].kind
        ? 0
        : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
    /**
     * display the top-level grouping as a "root" in the sidebar
     * @type {Boolean}
     */
    showRoots: true,
  },
  a11y: {
    element: "#root",
    config: {},
    options: {},
    manual: true,
  },
});
