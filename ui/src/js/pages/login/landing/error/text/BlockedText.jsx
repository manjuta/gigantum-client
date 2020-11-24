// @flow
// vendor
import React from 'react';


type Props = {
  admin: string,
  message: string,
}

const BlockedText = (props: Props) => {
  const { admin, message } = props;

  if (message === 'blocked') {
    return (
      <>
        { admin
          && (
            <p className="LoginError__p">
              Contact
              {' '}
              <a href={`mailto:${admin}`}>
                {admin}
              </a>
              {' '}
              to have your email address activated on this server. Once this is done, try to log in again.
            </p>
          )
        }
        { !admin
          && (
            <p className="LoginError__p">
              Contact your system administrator to have your email address activated on this server. Once this is done, try to log in again.
            </p>
          )
        }

        <div>
          <p className="LoginError__p">This server requires that all created accounts are explicitly authorized by an administrator. The email address associated with your account has not yet been activated.</p>
        </div>
      </>
    )
  }

  return null;
}


export default BlockedText;
