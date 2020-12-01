// @flow
// vendor
import React from 'react';
// assets
import checkSVG from 'Images/icons/check-primary.svg';
// css
import './PublishModalStatus.scss';

type Props = {
  name: string,
  owner: string,
}

const Complete = (props: Props) => {
  const { name, owner } = props;
  const text = `${owner}/${name} has been succesfully published`;
  return (
    <div className="PublishModalStatus">
      <h4 className="PublishModalStatus__h4">{text}</h4>
      <div className="PublishModalStatus__main">
        <img
          src={checkSVG}
          alt="Complete"
          height="80"
        />
      </div>
    </div>
  );
};

export default Complete;
