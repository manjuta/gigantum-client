// @flow
// vendor
import React from 'react';
// css
import './LoginError.scss';

type Props = {
  errorType: string,
  errorDescription: string,
}

const LoginError = (props: Props) => {
  const { errorType, errorDescription } = props;
  if (errorType) {
    return (
      <section className="LoginError">
        <h2 className="LoginError--type flex">
          <div className="LoginError--exclamation">
            !
          </div>
          <span>{errorType}</span>
        </h2>
        <p className="LoginError__p">
          {errorDescription}
        </p>
      </section>
    );
  }

  return null;
};

export default LoginError;
