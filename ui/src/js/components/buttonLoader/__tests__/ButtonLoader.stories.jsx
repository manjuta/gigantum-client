// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import { mount } from 'enzyme';
import sinon from 'sinon';
// css
import 'Styles/critical.scss';
// components
import ButtonLoader from '../ButtonLoader';

const mainProps = {
  buttonState: '',
  buttonText: 'Submit',
  buttonDisabled: false,
  className: null,
  clicked: sinon.spy(),
};

storiesOf('Components/ButtonLoader', module)
  .addParameters({
    jest: ['BuildProgress'],
  })
  .add('ButtonLoader Snapshot', () => <ButtonLoader {...mainProps} />);

describe('BuildProgress Unit Tests:', () => {
  const output = mount(<ButtonLoader {...mainProps} />);

  test('ButtonLoader text is equal to value in props', () => {
    const button = output.find('.ButtonLoader');
    expect(button.text()).toEqual('Submit');
  });

  test('ButtonLoader calls clicked when clicked', () => {
    const button = output.find('.ButtonLoader');
    button.simulate('click');
    expect(mainProps.clicked.calledOnce).toEqual(true);
  });


  test('ButtonLoader text when finished is a check mark', () => {
    mainProps.buttonState = 'finished';
    const finishedVersion = mount(<ButtonLoader {...mainProps} />);
    const button = finishedVersion.find('.ButtonLoader');

    expect(button.text()).toEqual('✓');
  });
});
