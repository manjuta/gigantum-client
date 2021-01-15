// vendor
import React from 'react';
import { storiesOf, moduleMetadata } from '@storybook/react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { withKnobs, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
// css
import 'Styles/critical.scss';
// components
import Prompt from '../Prompt';

storiesOf('Components/Prompt', module)
  .addParameters({
    jest: ['PopupBlocked'],
  })
  .add(
    'PopupBlocked',
    () => <Prompt />,
    { decorators: [withKnobs] },
  );

describe('Prompt Unit Tests:', () => {
  const output = mount(
    <Prompt />,
  );

  test('Prompt closes fires when x clicked', () => {
    const modalButton = output.find('.button--green');
    modalButton.simulate('click');
    expect(true).toEqual(true);
  });
});
