// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import sinon from 'sinon';
import { mount } from 'enzyme';
// css
import 'Styles/critical.scss';
// components
import Dropdown from '../Dropdown';

const mainProps = {
  customStyle: 'open',
  itemAction: sinon.spy(),
  label: 'Dropdowm title',
  listAction: sinon.spy(),
  listItems: [
    'item 1',
    'item 2',
    'item 3',
  ],
  visibility: true,
};

storiesOf('Components/Dropdown', module)
  .addParameters({
    jest: ['Dropdown'],
  })
  .add('Category Default', () => <Dropdown {...mainProps} />);

describe('Dropdown Unit Tests:', () => {
  const output = mount(<Dropdown {...mainProps} />);

  test('Dropdown test item click', () => {
    const catItem = output.find('.Dropdown__item').first();
    catItem.simulate('click');

    expect(mainProps.itemAction.calledOnce).toEqual(true);
  });


  test('Category test toggle tooltip', () => {
    const section = output.find('.Dropdown--open');
    section.simulate('click');
    expect(mainProps.listAction.calledOnce).toEqual(true);
  });
});
