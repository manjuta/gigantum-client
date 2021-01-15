// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import sinon from 'sinon';
import { mount } from 'enzyme';
// css
import 'Styles/critical.scss';
// components
import Lightbox from '../Lightbox';

const props = {
  imageMetadata: 'src',
  onClose: sinon.spy(),
};

storiesOf('Components/Lightbox', module)
  .addParameters({
    jest: ['Lightbox'],
  })
  .add('Lightbox', () => <Lightbox {...props} />);

describe('Lightbox Unit Tests:', () => {
  const output = mount(<Lightbox {...props} />);
  test('Lightbox registers click on cover', () => {
    const lightboxCover = output.find('.Lightbox__cover');
    lightboxCover.simulate('click');
    expect(props.onClose.calledOnce).toEqual(true);
  });


  test('Lightbox registers click on button', () => {
    const lightboxButton = output.find('.Btn__expandable-close');
    lightboxButton.simulate('click');
    expect(props.onClose.calledTwice).toEqual(true);
  });


  test('Lightbox unmounts and removes class from root', () => {
    const lightboxComponent = output.find(Lightbox).instance();
    lightboxComponent.componentWillUnmount();
    expect(document.getElementById('root').classList.contains('no-overflow')).toEqual(false);
  });
});
