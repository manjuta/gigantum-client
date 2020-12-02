import initStoryshots, { Stories2SnapsConverter } from '@storybook/addon-storyshots';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import path from 'path';

const converter = new Stories2SnapsConverter();

const modal = document.createElement('div');
modal.setAttribute('id', 'modal');
document.body.append(modal);

const modalCover = document.createElement('div');
modalCover.setAttribute('id', 'modal__cover');
document.body.append(modalCover);

const loader = document.createElement('div');
loader.setAttribute('id', 'loader');
document.body.append(loader);

initStoryshots({
  framework: 'react',
  configPath: path.join(__dirname, './AdvancedSearch.stories.jsx'),
  test: ({ story, context }) => {
    const snapshotFileName = converter.getSnapshotFileName(context);
    const storyElement = story.render();
    const shallowTree = mount(storyElement);


    if (snapshotFileName) {
      expect(toJson(shallowTree)).toMatchSpecificSnapshot(snapshotFileName);
    }
  },
});

export default {};
