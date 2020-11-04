// vendor
import React from 'react';
import renderer from 'react-test-renderer';
import relayTestingUtils from '@gigantum/relay-testing-utils';
// components
import DetailRecords from 'Pages/repository/shared/activity/wrappers/card/records/DetailRecords';
// data
import json from './__relaydata__/DetailRecords.json';


let fixtures = {
  keys: [],
  sectionType: 'labbook',
  detailRecords: [['text/hml', 'this is example Text']],
};

global.data['DetailRecordsQuery'] = json.data

describe('DetailRecords', () => {
  it('Renders a snapshot', () => {
    const wrapper = renderer.create(relayTestingUtils.relayWrap(
       <DetailRecords {...fixtures} />, {}, json.data.labbook)
    );

    const tree = wrapper.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
