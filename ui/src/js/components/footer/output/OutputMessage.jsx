// vendor
import React from 'react';
import Converter from 'ansi-to-html';
import hasAnsi from 'has-ansi';

type Props = {
  item: {
    message: string,
  }
}

const OutputMessage = ({ item }) => {
  if (hasAnsi(item.message)) {
    const converter = new Converter();
    const html = converter.toHtml(item.message);
    return (
      <div dangerouslySetInnerHTML={{ __html: html }} />
    );
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: item.message }} />
  );
};

export default OutputMessage;
