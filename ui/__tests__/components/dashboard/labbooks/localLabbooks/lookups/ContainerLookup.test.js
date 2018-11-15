
      import ContainerLookup from 'Components/dashboard/labbooks/localLabbooks/lookups/ContainerLookup';

      import relayTestingUtils from '@gigantum/relay-testing-utils';
      import json from '../__relaydata__/LocalLabbooks.json';

      describe('Test ContainerLookup', () => {
        it('returns a labbookList', async () => {
        let id = json.data.labbookList.localLabbooks.edges[0].node.id;
          await ContainerLookup.query([id]).then((response, error) => {
            console.log(response, error)
            expect(response.data.ids.length).toEqual(0);
          });
        })
      });
