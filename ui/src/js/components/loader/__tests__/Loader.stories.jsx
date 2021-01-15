// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import sinon from 'sinon';
import { mount } from 'enzyme';
// css
import 'Styles/critical.scss';
// components
import Loader from '../Loader';

const props = {
  nested: true,
};

const nestedAltProps = {
  nested: false,
};

storiesOf('Components/Loader', module)
  .addParameters({
    jest: ['Loader'],
  })
  .add('Loader', () => <Loader {...props} />)
  .add('Loader', () => <Loader {...nestedAltProps} />);

describe('Loader Unit Tests:', () => {
  test('Loader has nested className', () => {
    const output = mount(<Loader {...props} />);
    const loaderComponent = output.find('.Loader--nested');
    expect(loaderComponent.prop('className').indexOf('Loader--nested') > -1).toEqual(true);
  });


  test('Loader does not have nested className', () => {
    const output = mount(<Loader {...nestedAltProps} />);
    const loaderComponent = output.find('.Loader');
    expect(loaderComponent.prop('className').indexOf('Loader--nested') > -1).toEqual(false);
  });
});
