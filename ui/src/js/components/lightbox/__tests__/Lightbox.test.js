import initStoryshots, { Stories2SnapsConverter } from '@storybook/addon-storyshots';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import path from 'path';

const converter = new Stories2SnapsConverter();

const lightbox = document.createElement('div');
lightbox.setAttribute('id', 'lightbox');
document.body.append(lightbox);


const root = document.createElement('div');
root.setAttribute('id', 'root');
document.body.append(root);

initStoryshots({
  framework: 'react',
  configPath: path.join(__dirname, './Lightbox.stories.jsx'),
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
