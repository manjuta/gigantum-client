import React from 'react';
import { shallow, mount } from 'enzyme';
import Code from 'Pages/repository/labbook/code/Code';
import renderer from 'react-test-renderer';


test('Test Code rendering', () => {
  // const isAuthenticated = function(){return true};
  const component = renderer.create(
    <Code />,
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
