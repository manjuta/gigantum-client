// vendor
import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { mount } from 'enzyme';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import relayTestingUtils from '@gigantum/relay-testing-utils';
// css
import 'Styles/critical.scss';
// components
import FileBrowser from '../FileBrowser';
// data
import fileBrowserData from '../__mock__/fileBrowser.json';


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

const mainProps = {
  labbook: fileBrowserData.data.labbook,
  labbookId: fileBrowserData.data.labbook.id,
  isLocked: false,
  selectedFiles: [],
  clearSelectedFiles: () => {},
  codeId: fileBrowserData.data.labbook.code.id,
  code: fileBrowserData.data.labbook.code,
  loadStatus: () => {},
  files: fileBrowserData.data.labbook.code.allFiles,
};

const FileBrowserComponent = () => <FileBrowser {...mainProps} />;


const FileBrowserWrapped = DragDropContext(backend)(FileBrowserComponent);

storiesOf('FileBrowser/FileBrowser Snapshots:', module)
  .addParameters({
    jest: ['FileBrowser'],
  })
  .add('FileBrowser Default', () => {
    return <FileBrowserWrapped />;
  })

describe('FileBrowser Unit Tests:', () => {
  const output = mount(<FileBrowserWrapped />);
});
