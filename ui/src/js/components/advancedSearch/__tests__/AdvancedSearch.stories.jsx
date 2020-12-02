// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import { mount } from 'enzyme';
import { DragDropContext } from 'react-dnd';
import backend from 'Pages/repository/labbook/labbookBackend';
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
  withoutContext: () => {},
};

const AdvancedSearchWrapped = (props) => <AdvancedSearch {...mainProps} customStyle={props.customStyle} />

const AdvancedSearchDragDropContext = DragDropContext(backend)(AdvancedSearchWrapped);

storiesOf('Components/AdvancedSearch Snapshots:', module)
  .addParameters({
    jest: ['AdvancedSearch'],
  })
  .add('AdvancedSearch Default', () => {
    return <AdvancedSearchDragDropContext />;
  })
  .add('AdvancedSearch Packages', () => {
    return <AdvancedSearchDragDropContext customStyle="packages" />;
  });

describe('AdvancedSearch Unit Tests:', () => {
  const output = mount(<AdvancedSearchDragDropContext />);

  test('AdvancedSearch has 3 sections', () => {
    const section = output.find('.AdvancedSearch__filter-section');
    expect(section).toHaveLength(3);
  });
});
