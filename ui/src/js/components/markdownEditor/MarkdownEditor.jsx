// @flow
// vendor
import React, { Component } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import ReactDom from 'react-dom';
// css
import './MarkdownEditor.scss';

type Props = {
  markdown: string,
  updateMarkdownText: Function,
}

class MarkdownEditor extends Component<Props> {
  state = {
    isFullscreen: false,
    sideBySide: false,
  }

  /**
    Method updates fullscreen mode boolean
  */
  _setFullscreen = (isFullscreen, sideBySide) => {
    this.setState({ isFullscreen, sideBySide });
  }


  /**
   * @param {object} instance
    Method gets instance of mde and toggles views based on where the
    editor is rendered
  */
  _geMdeInsance = (instance) => {
    if (instance.toolbarElements === undefined) {
      return;
    }

    instance.toolbarElements.fullscreen.addEventListener('click', (() => {
      const { isFullscreen } = this.state;
      this._setFullscreen(!isFullscreen, false);
    }));

    instance.toolbarElements['side-by-side'].addEventListener('click', (() => {
      this._setFullscreen(true, true);
    }));

    if (this.state.isFullscreen) {
      instance.toggleFullScreen();
    }

    if (!this.state.isFullscreen) {
      document.body.style = '';
    }

    if (this.state.sideBySide) {
      instance.toggleSideBySide();
    }
  }

  render() {
    const { markdown, updateMarkdownText } = this.props;
    const { isFullscreen } = this.state;
    if (!isFullscreen) {
      return (
        <SimpleMDE
          getMdeInstance={this._geMdeInsance}
          id="markDown"
          label=""
          onChange={(evt) => { updateMarkdownText(evt); }}
          value={markdown}
          options={{
            autofocus: true,
            spellChecker: true,
          }}
        />
      );
    }
    return (
      ReactDom.createPortal(
        <div className="MarkdownEditor__fullscreen">
          <SimpleMDE
            getMdeInstance={this._geMdeInsance}
            id="markDownFullscreen"
            label=""
            onChange={(evt) => { updateMarkdownText(evt); }}
            value={markdown}
            options={{
              autofocus: true,
              spellChecker: true,
            }}
          />
        </div>,
        document.getElementById('markdown__fullscreen'),
      )
    );
  }
}

export default MarkdownEditor;
