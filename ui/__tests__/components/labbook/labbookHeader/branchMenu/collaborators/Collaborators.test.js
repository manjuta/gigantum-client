
import React from 'react'
import renderer from 'react-test-renderer';
import { mount } from 'enzyme'
import Collaborators from 'Pages/repository/labbook/labbookHeader/branchMenu/collaborators/Collaborators';

import relayTestingUtils from '@gigantum/relay-testing-utils'

test('Test Collaborators', () => {
  const wrapper = renderer.create(
     <Collaborators />,
  );

  const tree = wrapper.toJSON()

  expect(tree).toMatchSnapshot();
});
