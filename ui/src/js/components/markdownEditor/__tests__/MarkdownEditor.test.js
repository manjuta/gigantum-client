import initStoryshots, { Stories2SnapsConverter } from '@storybook/addon-storyshots';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import path from 'path';

const converter = new Stories2SnapsConverter();

global.body = { createTextRange: jest.fn() };

global.document.createRange = () => ({
  setEnd: () => {},
  setStart: () => {},
  getBoundingClientRect: () => {},
});

global.document.createTextRange = () => ({
  setEnd: () => {},
  setStart: () => {},
  getBoundingClientRect: () => {},
});

const markDownFullscreen = document.createElement('div');
markDownFullscreen.setAttribute('id', 'markdown__fullscreen');
document.body.append(markDownFullscreen);

const markDown = document.createElement('textarea');
markDown.setAttribute('id', 'markDown');
document.body.append(markDown);

const markDownFullscreenDiv = document.createElement('textarea');
markDownFullscreenDiv.setAttribute('id', 'markDownFullscreen');
document.body.append(markDownFullscreenDiv);

const root = document.createElement('div');
root.setAttribute('id', 'root');
document.body.append(root);

initStoryshots({
  framework: 'react',
  configPath: path.join(__dirname, './MarkdownEditor.stories.jsx'),
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
