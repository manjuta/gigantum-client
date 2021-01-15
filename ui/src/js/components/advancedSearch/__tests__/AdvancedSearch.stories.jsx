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
import AdvancedSearch from '../AdvancedSearch';

const mainProps = {
  autoHide: false,
  customStyle: {},
  filterCategories: {
    Languages: ['python', 'r', 'cobol'],
    'CUDA Version': ['jupyter', 'jupyterlab'],
    'Development Environments': ['salmon', 'trout', 'pike'],
  },
  setTags: () => {},
  showButton: true,
  tags: [],
  withoutContext: true,
};

const AdvancedSearchWrapped = (props) => <AdvancedSearch {...mainProps} customStyle={props.customStyle} />;

const AdvancedSearchDragDropContext = DragDropContext(backend)(AdvancedSearchWrapped);

storiesOf('Components/AdvancedSearch', module)
  .addParameters({
    jest: ['AdvancedSearch'],
  })
  .add('AdvancedSearch Default', () => <AdvancedSearchDragDropContext />)
  .add('AdvancedSearch Packages', () => <AdvancedSearchDragDropContext customStyle="packages" />);

describe('AdvancedSearch Unit Tests:', () => {
  const output = mount(<AdvancedSearchDragDropContext />);

  test('AdvancedSearch has 3 sections', () => {
    const section = output.find('.AdvancedSearch__filter-section');
    expect(section).toHaveLength(3);
  });


  test('AdvancedSearch', () => {
    const advancedSearchWrapper = output.find(AdvancedSearch).instance();
    advancedSearchWrapper.advancedSearch.handleFocus({ target: {} });
    expect(output.find(AdvancedSearch).instance().state.focused).toEqual(true);
  });

  test('AdvancedSearch react tags focuses on click', () => {
    const advancedSearchWrapper = output.find(AdvancedSearch).instance();
    advancedSearchWrapper.advancedSearch.handleFocus({ target: {} });
    expect(output.find(AdvancedSearch).instance().state.focused).toEqual(true);
  });

  test('AdvancedSearch tag addition', () => {
    const advancedSearchWrapper = output.find(AdvancedSearch).instance();
    advancedSearchWrapper.advancedSearch.props.handleAddition('jupyter');
    expect(advancedSearchWrapper.advancedSearch.props.tags[0]).toEqual('jupyter');
  });


  test('AdvancedSearch tag deletion', () => {
    const advancedSearchWrapper = output.find(AdvancedSearch).instance();
    advancedSearchWrapper.advancedSearch.props.handleDelete(0);
    expect(advancedSearchWrapper.advancedSearch.props.tags.length).toEqual(0);
  });


  test('AdvancedSearch tag addition from list', () => {
    const advancedSearchWrapper = output.find(AdvancedSearch).instance();
    advancedSearchWrapper.advancedSearch.props.handleAddition({ text: 'jupyter', className: 'CUDA Version' });
    expect(advancedSearchWrapper.advancedSearch.props.tags[0].text).toEqual('jupyter');
  });


  test('AdvancedSearch tag deletion with list item', () => {
    const advancedSearchWrapper = output.find(AdvancedSearch).instance();
    advancedSearchWrapper.advancedSearch.props.handleDelete(0);
    expect(advancedSearchWrapper.advancedSearch.props.tags.length).toEqual(0);
  });


  test('AdvancedSearch tag deletion with list item', () => {
    const advancedSearchWrapper = output.find(AdvancedSearch).instance();
    advancedSearchWrapper.advancedSearch = {
      value: 'jupyter',
    };
    const advancedBtnAdd = output.find(AdvancedSearch).find('.Btn__AdvancedSearch').get(0);
    advancedBtnAdd.props.onClick();
    expect(advancedSearchWrapper.props.tags[0].text).toEqual('jupyter');
  });

  test('AdvancedSearch unmount', () => {
    const spy = sinon.spy();
    const advancedSearchWrapper = output.find(AdvancedSearch).instance();
    advancedSearchWrapper.componentWillUnmount();

    // expect(spy.calledOnce).toEqual(true);
    expect(advancedSearchWrapper.state.focused).toEqual(true);
  });
});
