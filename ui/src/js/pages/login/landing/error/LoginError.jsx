// @flow
// vendor
import React from 'react';
import { Link } from 'react-router-dom';
// components
import BlockedText from './text/BlockedText';
// css
import './LoginError.scss';

type Props = {
  errors: Array,
}

const LoginError = (props: Props) => {
  const { errors } = props;

  if (errors && errors[0] && errors[0].message) {
    const admin = errors[0].admin
      ? atob(errors[0].admin)
      : 'support@gigantum.com';
    const header = (errors[0].message === 'blocked')
      ? 'Account Activation Required'
      : 'Authentication Error';
    const message = errors[0].message;

    return (
      <section className="LoginError">
        <h4 className="LoginError--type">
          <div className="LoginError--exclamation">
            !
          </div>
          <div>{header}</div>
        </h4>

        <BlockedText
          admin={admin}
          message={message}
        />

        { (errors[0].message !== 'blocked')
          && (
            <>
              <p className="LoginError__p LoginError__p--orange">errors[0].message</p>

              <p className="LoginError__p">Please verify that that the Client is running by clicking on the Gigantum logo in your system tray to open Gigantum Desktop.</p>
              <p className="LoginError__p">
                If the problem persists, try the steps outlined
                {' '}
                <a className="LoginError__a" href="https://docs.gigantum.com/docs/client-interface-fails-to-load">here</a>
                , contact
                {' '}
                <a className="LoginError__a" href={`mailto:${admin}`}>{admin}</a>
                , or visit our
                {' '}
                <a className="LoginError__a" href="support@gigantum.com">forum</a>
                {' '}
                and post a question.
              </p>
            </>
          )
        }

        <Link className="LoginError__a LoginError__a--underline" to="/login">Try Again</Link>
      </section>
    );
  }

  return null;
};

export default LoginError;
