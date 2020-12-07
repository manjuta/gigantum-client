// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import { mount } from 'enzyme';
// css
import 'Styles/critical.scss';
// components
import ActionsMenu from '../ActionsMenu';
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

const file = {
  edge,
};

const mainProps = {
  closeLinkModal: () => {},
  togglePopup: () => {},
  addFolderVisible: () => {},
  renameEditMode: () => {},
  edge,
  mutationData,
  mutations: {
    moveLabbookFile: () => {},
  },
  fileData: file,
  folder: false,
};

const ActionsMenuWrapped = () => <ActionsMenu {...mainProps} />;

storiesOf('FileBrowser/ActionsMenu Snapshots:', module)
  .addParameters({
    jest: ['ActionsMenu'],
  })
  .add('ActionsMenu Default', () => {
    return <ActionsMenuWrapped />;
  })

describe('ActionsMenu Unit Tests:', () => {
  const output = mount(<ActionsMenuWrapped />);
});
