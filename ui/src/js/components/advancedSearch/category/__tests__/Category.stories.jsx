// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { DragDropContext } from 'react-dnd';
import backend from 'Pages/repository/labbook/labbookBackend';
import { WithContext, WithOutContext } from 'react-tag-input';
// css
import 'Styles/critical.scss';
// components
import Category from '../Category';

const mainProps = {
  category: 'CUDA Version',
  expandedIndex: 1,
  filterCategories: {
    Languages: ['python', 'r', 'cobol'],
    'CUDA Version': ['jupyter', 'jupyterlab'],
    'Development Environments': ['salmon', 'trout', 'pike'],
  },
  handleAddition: sinon.spy(),
  index: 1,
  setExpandedIndex: sinon.spy(),
  toggleTooltip: sinon.spy(),
  tooltipShown: true,
};

storiesOf('Components/AdvancedSearch/Category', module)
  .addParameters({
    jest: ['Category'],
  })
  .add('Category Default', () => <Category {...mainProps} />);

describe('AdvancedSearch Unit Tests:', () => {
  const output = mount(<Category {...mainProps} />);

  test('Category test', () => {
    const section = output.find('.AdvancedSearch__filter-section');
    section.simulate('click');
    expect(mainProps.setExpandedIndex.calledOnce).toEqual(true);
  });

  test('Category test toggle tooltip', () => {
    const catItem = output.find('.AdvancedSearch__li.CUDA.Version').first();
    catItem.simulate('click');

    expect(mainProps.handleAddition.calledOnce).toEqual(true);
  });


  test('Category test toggle tooltip', () => {
    const section = output.find('.AdvancedSearch__info');
    section.simulate('click');
    expect(mainProps.toggleTooltip.calledOnce).toEqual(true);
  });
});
