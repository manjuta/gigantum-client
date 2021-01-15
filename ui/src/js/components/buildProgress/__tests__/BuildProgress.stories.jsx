// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
// store
import store from 'JS/redux/store';
import {
  setMultiInfoMessage,
} from 'JS/redux/actions/footer';
// css
import 'Styles/critical.scss';
// utils
import { messageParser } from 'Components/footer/FooterUtils';
// data
import buildProgressJson from './data/BuildProgress.json';
// components
import BuildProgress from '../BuildProgress';

const mainProps = {
  buildId: 'id',
  headerText: 'This is the header',
  keepOpen: true,
  messageStackHistory: [],
  name: 'project-name',
  owner: 'owner-name',
  toggleModal: () => {},
};

const BuildProgressWrapped = () => (
  <Provider store={store}>
    <BuildProgress {...mainProps} />
  </Provider>
);

const responseData = {
  data: {
    jobStatus: {
      jobMetadata: JSON.stringify(buildProgressJson),
    },
  },
};

const { html, message } = messageParser(responseData);

const messageData = {
  id: 'id',
  message,
  isLast: true,
  error: null,
  status: buildProgressJson.status,
  messageBody: [{ message: html }],
  buildProgress: true,
};

storiesOf('Components/BuildProgress', module)
  .addParameters({
    jest: ['BuildProgress'],
  })
  .add('BuildProgress Default', () => <BuildProgressWrapped />)
  .add('BuildProgress Complete', () => {
    const {
      name,
      owner,
    } = mainProps;
    setMultiInfoMessage(owner, name, messageData);
    return <BuildProgressWrapped />;
  });

describe('BuildProgress Unit Tests:', () => {
  const output = mount(<BuildProgressWrapped />);
  const {
    name,
    owner,
  } = mainProps;

  test('BuildProgress has matching header text to props', () => {
    const headerText = output.find('.BuildProgress__header-text');
    expect(headerText.text()).toEqual('This is the header');
  });

  test('BuildProgress complete', () => {
    setMultiInfoMessage(owner, name, messageData);
    const headerText = output.find('.BuildProgress__header-text');
    expect(headerText.text()).toEqual('This is the header');
  });
});
