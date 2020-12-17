import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
// environment
import environment from 'JS/createRelayEnvironment';
// components
import DetailsRecords from './DetailRecords';

const DetailRecordsQuery = graphql`
query DetailRecordsWrapperQuery($name: String!, $owner: String!, $keys: [String]){
  labbook(name: $name, owner: $owner){
    id
    description
    detailRecords(keys: $keys){
      id
      action
      key
      data
      type
      show
      importance
      tags
    }
  }
}`;
const DetailRecordsDatasetsQuery = graphql`
query DetailRecordsWrapperDatasetsQuery($name: String!, $owner: String!, $keys: [String]){
  dataset(name: $name, owner: $owner){
    id
    description
    detailRecords(keys: $keys){
      id
      action
      key
      data
      type
      show
      importance
      tags
    }
  }
}`;

type Props = {
  isNote: Boolean,
  keys: Array,
  name: String,
  owner: String,
  sectionType: String,
};


const DetailRecordsWrapper = (props: Props) => {
  const {
    isNote,
    keys,
    name,
    owner,
    sectionType,
  } = props;

  const variables = {
    keys,
    name,
    owner,
  };

  const query = (sectionType === 'labbook')
    ? DetailRecordsQuery
    : DetailRecordsDatasetsQuery;

  return (
    <QueryRenderer
      environment={environment}
      query={query}
      variables={variables}
      render={(response) => {
        if (response && response.props) {
          return (
            <DetailsRecords
              {...response.props[sectionType]}
              isNote={isNote}
            />
          );
        }

        return (
          <div className="DetailsRecords__loader-group">
            <div className="DetailsRecords__loader" />
            <div className="DetailsRecords__loader" />
            <div className="DetailsRecords__loader" />
          </div>
        );
      }}
    />
  );
};

export default DetailRecordsWrapper;
