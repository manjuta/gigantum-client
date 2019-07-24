// vendor
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Editor from 'react-simple-code-editor';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/nightOwl';
// assets
import './CodeEditor.scss';

theme.plain.backgroundColor = '#1f2733';
theme.plain.color = '#FFFFFF';

class CodeEditor extends React.PureComponent {
  /**
  *  @param {String} code
  *  renders the highlighter component
  *  @return {jsx}
  */
  _highlighter = code => (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={code}
      language="dockerfile"
    >
      {({
        tokens,
        getLineProps,
        getTokenProps,
      }) => (
        <Fragment>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              <div className="CodeEditor__lineNumbers">{i + 1}</div>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </Fragment>
      )}
    </Highlight>
  )

  render() {
    const { props } = this;
    return (
      <div className="CodeEditor">
        <Editor
          value={props.value}
          onValueChange={props.onValueChange}
          highlight={this._highlighter}
          padding={10}
          style={theme.plain}
        />
      </div>
    );
  }
}

CodeEditor.defaultProps = {
  language: '',
};

CodeEditor.propTypes = {
  value: PropTypes.string.isRequired,
  language: PropTypes.string,
};

export default CodeEditor;
