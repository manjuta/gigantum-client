
      import React from 'react';
      import renderer from 'react-test-renderer';
      import { mount } from 'enzyme';
      import CollaboratorButton from 'Pages/repository/labbook/branchMenu/CollaboratorButton';

      import relayTestingUtils from '@gigantum/relay-testing-utils';

      test('Test CollaboratorButton', () => {
        const wrapper = renderer.create(

           <CollaboratorButton />,

        );

        const tree = wrapper.toJSON();

        expect(tree).toMatchSnapshot();
      });
