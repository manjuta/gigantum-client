// @flow
// vendor
import React from 'react';
// assets
import warningSVG from 'Images/icons/warning.svg';
// css
import './PublishModalStatus.scss';

type Props = {
  name: string,
  owner: string,
}

const Error = (props: Props) => {
  const { name, owner } = props;
  const text = `There was a problem publishing ${owner}/${name}`;
  return (
    <div className="PublishModalStatus">
      <div className="flex">
        <img
          className="PublishModalStatus__image--warning"
          src={warningSVG}
          alt="Error"
          height="30"
        />
        <h4 className="PublishModalStatus__h4 PublishModalStatus__h4--warning">{text}</h4>
      </div>
    </div>
  );
};

export default Error;
