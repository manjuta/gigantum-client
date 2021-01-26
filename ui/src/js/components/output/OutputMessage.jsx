// vendor
import React from 'react';

type Props = {
 message: string,
};


const hasAnsi = (message) => message.indexOf('\n') > -1;

const OutputMessage = ({ message }) => {
  if (hasAnsi(message)) {
    const html = message.replace(/\n/g, '<br />');
    return (
      <div dangerouslySetInnerHTML={{ __html: html }} />
    );
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: message }} />
  );
};

export default OutputMessage;
