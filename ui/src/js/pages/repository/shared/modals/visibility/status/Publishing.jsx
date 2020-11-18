// @flow
// vendor
import React from 'react';
import Loader from 'Components/loader/Loader';
// css
import './PublishModalStatus.scss';

type Props = {
  name: string
}

const Publishing = (props: Props) => {
  const { name, owner } = props;
  const text = `Publishing ${owner}/${name}`;
  return (
    <div className="PublishModalStatus">
      <h4 className="PublishModalStatus__h4">{text}</h4>

      <Loader nested={true}/>

    </div>
  );
};

export default Publishing;
