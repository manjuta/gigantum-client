// vendor
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import SyntaxHighlighterHLJS from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/styles/hljs';
// json
import customizedStyling from './CodeBlockStyle';
// assets
import './CodeBlock.scss';


class CodeBlock extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setRef = this.setRef.bind(this);
  }

  setRef(el) {
    this.codeEl = el;
  }

  render() {
    const code = this.props.value;
    const language = this.props.language ? this.props.language : 'python';
    const style = customizedStyling;
    console.log(style)
    console.log(language)
    const codeCSS = classNames({
      CodeBlock: true,
    });
    return (
      <SyntaxHighlighter
        className={codeCSS}
        language={language}
        style={style}
      >
        {code}
      </SyntaxHighlighter>
    );
  }
}

CodeBlock.defaultProps = {
  language: '',
};

CodeBlock.propTypes = {
  value: PropTypes.string.isRequired,
  language: PropTypes.string,
};

export default CodeBlock;
