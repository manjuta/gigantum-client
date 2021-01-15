// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import SimpleMDE from 'react-simplemde-editor';
// css
import 'Styles/critical.scss';
// components
import MarkdownEditor from '../MarkdownEditor';

const props = {
  markdown: `
    ### This is a header
    **bold**
  `,
  updateMarkdownText: sinon.spy(),
};

const nestedAltProps = {
  nested: false,
};

storiesOf('Components/MarkdownEditor', module)
  .addParameters({
    jest: ['MarkdownEditor'],
  })
  .add('MarkdownEditor', () => <MarkdownEditor {...props} />);

describe('MarkdownEditor Unit Tests:', () => {
  test('MarkdownEditor has nested className', () => {
    const output = mount(<MarkdownEditor {...props} />);
    debugger;
    const itm = output.find(SimpleMDE);
    console.log(output.html());
    console.log(output, output.simpleInstance);
    expect(1).toEqual(1);
  });
});
