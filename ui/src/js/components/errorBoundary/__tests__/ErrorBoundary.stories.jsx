// vendor
import React from 'react';
import { storiesOf } from '@storybook/react';
import sinon from 'sinon';
import { mount } from 'enzyme';
// css
import 'Styles/critical.scss';
// components
import ErrorBoundary from '../ErrorBoundary';

const mainProps = {
  type: 'packageError',
};

const conainerStatusProps = {
  type: 'containerStatusError',
};

const ErrorComp = (props) => <div>JSX to be rendered</div>;
const errorForceProps = {
  type: 'containerStatusError',
};

storiesOf('Components/ErrorBoundary', module)
  .addParameters({
    jest: ['ErrorBoundary'],
  })
  .add('ErrorBoundary', () => (
    <ErrorBoundary {...errorForceProps}>
      <ErrorComp />
    </ErrorBoundary>
  ))
  .add('ErrorBoundary containerStatusError', () => (
    <ErrorBoundary {...conainerStatusProps}>
      <ErrorComp />
    </ErrorBoundary>
  ))
  .add('ErrorBoundary Passes', () => (
    <ErrorBoundary {...mainProps}>
      <ErrorComp />
    </ErrorBoundary>
  ));


describe('Dropdown Unit Tests:', () => {
  const output = mount(
    <ErrorBoundary {...errorForceProps}>
      <ErrorComp />
    </ErrorBoundary>,
  );

  test('Dropdown test item click', () => {
    const error = new Error('test');
    output.find(ErrorComp).simulateError(error);
    expect(output.instance().state.hasError).toEqual(true);
  });
});
