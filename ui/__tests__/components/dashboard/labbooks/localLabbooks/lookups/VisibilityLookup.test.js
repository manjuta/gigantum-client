
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import VisibilityLookup from 'Components/dashboard/labbooks/localLabbooks/lookups/VisibilityLookup';

      import relayTestingUtils from '@gigantum/relay-testing-utils';

      test('Test VisibilityLookup', () => {

        const wrapper = renderer.create(

           <VisibilityLookup />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
