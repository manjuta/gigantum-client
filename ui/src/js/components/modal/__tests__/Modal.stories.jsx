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
import Modal from '../Modal';


const props = {
  handleClose: sinon.spy(),
  header: 'Sync Branch',
  icon: 'add',
  noPadding: true,
  noPaddingModal: true,
  overlfow: 'visible',
  preHeader: 'Preheader text',
  size: 'large',
};

storiesOf('Components/Modal', module)
  .addParameters({
    jest: ['Modal'],
  })
  .add(
    'Modal',
    () => {
      const handleClose = action('close');
      const header = select('Header Text', ['Create Branch', 'Sync Branch'], 'Sync Branch');
      const icon = select('icon', ['create', 'add'], 'create');
      const noPadding = select('noPadding', [false, true], false);
      const noPaddingModal = select('noPaddingModal', [false, true], false);
      const overlfow = select('overlfow', ['visible', 'hidden'], 'visible');
      const preHeader = select('preHeader', ['Create a Branch', 'Sync your branch'], 'Create a Branch');
      const size = select('size', ['small', 'large', 'large--long'], 'large');
      return (
        <Modal
          handleClose={handleClose}
          header={header}
          icon={icon}
          noPadding={noPadding}
          noPaddingModal={noPaddingModal}
          overlfow={overlfow}
          preHeader={preHeader}
          size={size}
        >
          <div>content</div>
        </Modal>
      );
    },
    { decorators: [withKnobs] },
  );

describe('Modal Unit Tests:', () => {
  const output = mount(
    <Modal {...props}>
      <div>content</div>
    </Modal>,
  );

  test('Modal close fires when clicked', () => {
    const modalButton = output.find('.Modal__close');
    modalButton.simulate('click');
    expect(props.handleClose.calledOnce).toEqual(true);
  });

  test('Modal preHeader matches props', () => {
    const modalPreheaderText = output.find('.Modal__pre-header');
    expect(modalPreheaderText.text()).toEqual(props.preHeader);
  });

  test('Modal header matches props', () => {
    const modalHeaderText = output.find('.Modal__header');
    expect(modalHeaderText.text()).toEqual(props.header);
  });

  test('Modal unmounts and removes class from root', () => {
    const modalComponent = output.find(Modal).instance();
    modalComponent.componentWillUnmount();
    expect(document.getElementById('root').classList.contains('no-overflow')).toEqual(false);
  });
});
