// @flow
// vendor
import React from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';
// Components
import CodeBlock from 'Pages/repository/labbook/renderers/CodeBlock';

type Props = {
  item: Array,
  isNote: boolean,
}

/**
  @param {Array} item
  returns tag to render if item matches a case
  @return {JSX}
*/
const RenderDetail = (props: Props) => {
  const { item, isNote } = props;
  const markdownCSS = classNames({
    ReactMarkdown: true,
    Markdown: isNote,
  });

  switch (item[0]) {
    case 'text/plain':
      return (<div className="ReactMarkdown"><p>{item[1]}</p></div>);
    case 'image/png':
      return (<img alt="detail" src={item[1]} />);
    case 'image/jpg':
      return (<img alt="detail" src={item[1]} />);
    case 'image/jpeg':
      return (<img alt="detail" src={item[1]} />);
    case 'image/bmp':
      return (<img alt="detail" src={item[1]} />);
    case 'image/gif':
      return (<img alt="detail" src={item[1]} />);
    case 'text/markdown':
      return (
        <ReactMarkdown
          renderers={{ code: codeProps => <CodeBlock {...codeProps} /> }}
          className={markdownCSS}
          source={item[1]}
        />
      );
    default:
      return (<b>{item[1]}</b>);
  }
};

export default RenderDetail;
