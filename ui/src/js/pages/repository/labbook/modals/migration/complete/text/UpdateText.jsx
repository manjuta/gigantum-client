// @flow
// vendor
import React from 'react';

type Props = {
  defaultRemote: string,
}

const UpdateText = (props: Props) => {
  const { defaultRemote } = props;
  if (defaultRemote) {
    return (
      <>
        You should now click
        <b> sync </b>
        to push the new
        <b> master </b>
        branch to the cloud. This is the new primary branch to work from.
      </>
    );
  }

  return (
    <>
      Your work has been migrated to the
      <b> master </b>
      branch. This is the new primary branch to work from.
    </>
  );
};

export default UpdateText;
