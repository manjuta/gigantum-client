// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import { mount } from 'enzyme';
import path from 'path';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
// css
import 'Styles/critical.scss';
// components
import File from '../File';
// data
import fileBrowserData from '../../../__mock__/fileBrowser.json';

const edge = fileBrowserData.data.labbook.code.allFiles.edges[1];
const filename = path.basename(edge.node.key);
const file = {
  edge,
};

const backend = (manager: Object) => {
  const backend = HTML5Backend(manager),
      orgTopDropCapture = backend.handleTopDropCapture;

  backend.handleTopDropCapture = (e) => {
      if (backend.currentNativeSource) {
        orgTopDropCapture.call(backend, e);
      }
  };

  return backend;
};

const mutationData = {
  owner: 'uitest',
  labbookName: 'ui-test-project',
  section: 'code',
  connection: 'CodeBrowser_allFiles',
  favoriteConnection: 'CodeFavorite_favorites',
  parentId: fileBrowserData.data.labbook.id,
};

const mainProps = {
  connectDragSource: jsx => jsx,
  closeLinkModal: () => {},
  setState: () => {},
  updateChildState: () => {},
  codeDirUpload: () => {},
  isSelected: true,
  filename,
  key: file.edge.node.key,
  multiSelect: false,
  mutationData,
  fileData: file,
  mutations: {
    moveLabbookFile: () => {},
  },
  sort: 'all',
  reverse: true,
  childrenState: {},
  section: 'code',
  isDragging: false,
};

const Filecomponent = () => <File {...mainProps} />;
const FileWrapped = DragDropContext(backend)(Filecomponent);

storiesOf('FileBrowser/File Snapshots:', module)
  .addParameters({
    jest: ['File'],
  })
  .add('File Default', () => {
    return <FileWrapped />;
  });

describe('File Unit Tests:', () => {
  const output = mount(<FileWrapped />);
  test('Rename', () => {
    const evt = {
      target: {
        value: 'NewFileName.js',
      },
    };
    output.find('.Btn__rename').simulate('click');
    output.find('.File__input').simulate('change', evt);
    expect(output.state('newFileName')).toEqual(evt.target.value);
  });

  test('Cancel rename', () => {
    output.find('.File__btn--rename-cancel').simulate('click');
    expect(output.state('newFileName')).toEqual(mainProps.filename);
  });


  test('Rename add', () => {
    const evt = {
      target: {
        value: 'NewFileName.js',
      },
    };
    output.find('.Btn__rename').simulate('click');
    output.find('.File__input').simulate('change', evt);
    output.find('.File__btn--rename-add').simulate('click');
    expect(mainProps.mutations.moveLabbookFile.mock.calls.length).toEqual(1);
  });

  test('Mouseover file row', () => {
    const evt = {
      preventDefault: () => {},
    };
    output.find('.File').simulate('mouseover', evt);
    expect(output.state('hover')).toEqual(true);
  });


  test('Mouseout file row', () => {
    const evt = {
      preventDefault: () => {},
    };
    output.find('.File').simulate('mouseout', evt);
    expect(output.state('hover')).toEqual(false);
  });

  test('MouseEnter', () => {
    const evt = {
      preventDefault: () => {},
    };
    output.setProps({ isDragging: true });
    output.setState({ isDragging: true, isHovered: true });
    output.find('.File').simulate('mouseEnter', evt);
    expect(output.state('isDragging')).toEqual(true);
  });


  test('MouseLeave', () => {
    const evt = {
      preventDefault: () => {},
    };
    output.setProps({ isDragging: false });
    output.setState({ isDragging: false, isHovered: false });
    output.find('.File').simulate('mouseLeave', evt);
    expect(output.state('isDragging')).toEqual(false);
  });

  test('Set File to unchecked', () => {
    const evt = {
      preventDefault: () => {},
      stopPropagation: () => {},
    };
    output.find('.CheckboxMultiselect__check').simulate('click', evt);
    expect(output.state('isSelected')).toEqual(false);
  });

  test('Set File to checked', () => {
    const evt = {
      preventDefault: () => {},
      stopPropagation: () => {},
    };
    output.find('.CheckboxMultiselect__uncheck').simulate('click', evt);
    expect(output.state('isSelected')).toEqual(true);
  });
});
