// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import { mount } from 'enzyme';
// css
import 'Styles/critical.scss';
// components
import BrowserSupport from '../BrowserSupport';

const mainProps = {
};

const BrowserSupportWrapped = () => <BrowserSupport {...mainProps} />;

storiesOf('Components/BrowserSupport Snapshots:', module)
  .addParameters({
    jest: ['BrowserSupport'],
  })
  .add('BrowserSupport Default', () => {
    return <BrowserSupportWrapped />;
  })

describe('BrowserSupport Unit Tests:', () => {
  const output = mount(<BrowserSupportWrapped />);
});
