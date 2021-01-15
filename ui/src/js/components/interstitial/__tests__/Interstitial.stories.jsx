// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
// css
import 'Styles/critical.scss';
// components
import Interstitial from '../Interstitial';

const errorProps = {
  message: 'Error: Cannot read error.',
  messageType: 'error',
};

const loaderProps = {
  message: 'Error: Cannot read error.',
  messageType: 'loader',
};

storiesOf('Components/Interstitial', module)
  .addParameters({
    jest: ['Interstitial'],
  })
  .add('Interstitial Error', () => <Interstitial {...errorProps} />)
  .add('Interstitial Loader', () => <Interstitial {...loaderProps} />);

describe('Interstitial Unit Tests:', () => {
  test('Interstitial has expected image', () => {
    const output = shallow(<Interstitial {...errorProps} />);
    const errorImage = output.find('.Interstitial--exclamation');
    expect(errorImage.prop('alt')).toEqual('Error');
  });


  test('Interstitial has expected loader', () => {
    const output = shallow(<Interstitial {...loaderProps} />);
    const errorLoader = output.find('.Interstitial__loader');
    expect(errorLoader.prop('className').indexOf('Interstitial__loader')).toEqual(0);
  });
});
