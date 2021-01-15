// vendor
import React from 'react';
import { storiesOf, moduleMetadata } from '@storybook/react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { withKnobs, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
// css
import 'Styles/critical.scss';
// components
import PopupBlocked from '../PopupBlocked';


const props = {
  attemptRelaunch: sinon.spy(),
  devTool: 'jupyter',
  togglePopupModal: sinon.spy(),
};

storiesOf('Components/PopupBlocked', module)
  .addParameters({
    jest: ['PopupBlocked'],
  })
  .add(
    'PopupBlocked',
    () => {
      const attemptRelaunch = action('attemptRelaunch');
      const devTool = select('dev tool', ['jupyter', 'rStudio'], 'jupyter');
      const togglePopupModal = action('togglePopupModal');

      return (
        <PopupBlocked
          attemptRelaunch={attemptRelaunch}
          devTool={devTool}
          togglePopupModal={togglePopupModal}
        />
      );
    },
    { decorators: [withKnobs] },
  );

describe('PopupBlocked Unit Tests:', () => {
  const output = mount(
    <PopupBlocked {...props} />,
  );

  test('PopupBlocked closes fires when x clicked', () => {
    const modalButton = output.find('.Modal__close');
    modalButton.simulate('click');
    expect(props.togglePopupModal.calledOnce).toEqual(true);
  });

  test('PopupBlocked closes when clicked cancel clicked', () => {
    const modalButton = output.find('.Btn--flat').at(1);
    modalButton.simulate('click');
    expect(props.togglePopupModal.calledTwice).toEqual(true);
  });

  test('PopupBlocked attemptRelaunch fires when Launch again clicked', () => {
    const modalButton = output.find('.Btn--popup-blocked');
    modalButton.simulate('click');
    expect(props.attemptRelaunch.calledOnce).toEqual(true);
  });
});
