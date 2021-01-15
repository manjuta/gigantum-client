// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
// store
import store from 'JS/redux/store';
// css
import 'Styles/critical.scss';
// components
import Helper from '../Helper';

const mainProps = {
  auth: {
    isAuthenticated: () => new Promise((resolve, reject) => {
      resolve({
        show: true,
      });
    }),
  },
  footerVisible: false,
  isVisible: false,
  setResizeHelper: sinon.spy(),
  setHelperVisibility: sinon.spy(),
  uploadOpen: false,
};

const HelperWrapped = () => (
  <Provider store={store}>
    <Helper {...mainProps} />
  </Provider>
);

storiesOf('Components/Helper Snapshots:', module)
  .addParameters({
    jest: ['Helper'],
  })
  .add('Helper Default', () => <HelperWrapped />);

describe('Helper Unit Tests:', () => {
  const output = mount(<HelperWrapped />);

  test('Helper show & hide showPopup', () => {
    localStorage.setItem('guideShown', false);
    const helperWrapper = output.find(Helper).instance();
    expect(helperWrapper.state().showPopup).toEqual(true);
  });

  test('Helper show & hide showPopup', () => {
    localStorage.setItem('guideShown', false);
    const helperButton = output.find('button--green');
    helperButton.simulate('click');
    expect(output.find(Helper).instance().state.showPopup).toEqual(true);
  });
});
