// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import { mount } from 'enzyme';
// css
import 'Styles/critical.scss';
// components
import BrowserSupport from '../BrowserSupport';

storiesOf('Components/BrowserSupport', module)
  .addParameters({
    jest: ['BrowserSupport'],
  })
  .add('BrowserSupport Packages', () => <BrowserSupport />);

describe('BrowserSupport Unit Tests:', () => {
  const output = mount(<BrowserSupport />);

  test('BrowserSupport has logo', () => {
    const section = output.find('.BrowserSupport__img');
    expect(section).toHaveLength(1);
  });
});
