// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import { mount } from 'enzyme';
// css
import 'Styles/critical.scss';
// components
import AddSubfolder from '../AddSubfolder';
// data
import fileBrowserData from '../../../__mock__/fileBrowser.json';

const edge = fileBrowserData.data.labbook.code.allFiles.edges[1];

const mutationData = {
  owner: 'uitest',
  labbookName: 'ui-test-project',
  section: 'code',
  connection: 'CodeBrowser_allFiles',
  favoriteConnection: 'CodeFavorite_favorites',
  parentId: fileBrowserData.data.labbook.id,
};

const mainProps = {
  setAddFolderVisible: () => {},
  rowStyle: {},
  key: 'Folder__subfolder',
  folderKey: edge.node.key,
  mutationData,
  mutations: {},
  addFolderVisible: true,
};

const AddSubfolderWrapped = () => <AddSubfolder {...mainProps} />;

storiesOf('FileBrowser/AddSubfolder Snapshots:', module)
  .addParameters({
    jest: ['AddSubfolder'],
  })
  .add('AddSubfolder Default', () => {
    return <AddSubfolderWrapped />;
  })

describe('AddSubfolder Unit Tests:', () => {
  const output = mount(<AddSubfolderWrapped />);
});
