// @flow
// vendor
import React from 'react';
// assets
import warningSVG from 'Images/icons/warning.svg';
// css
import './PublishModalStatus.scss';

type Props = {
  failureMessage: string,
  name: string,
  owner: string,
}

const Error = (props: Props) => {
  const { failureMessage, name, owner } = props;
  const headerText = `There was a problem publishing ${owner}/${name}`;
  return (
    <div className="PublishModalStatus">
      <div className="PublishModalStatus__error flex">
        <img
          className="PublishModalStatus__image--warning"
          src={warningSVG}
          alt="Error"
          height="30"
        />
        <h4 className="PublishModalStatus__h4 PublishModalStatus__h4--warning">{headerText}</h4>
      </div>

      <div className="PublishModalStatus__main">
        <p>{failureMessage}</p>
      </div>
    </div>
  );
};

export default Error;
