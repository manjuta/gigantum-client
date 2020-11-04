// @flow
// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// assets
import './AddSubfolder.scss';


class AddSubfolder extends Component {
  state = {
    editMode: false,
    folderName: '',
  }

  componentDidMount() {
    window.addEventListener('click', this._clickedOffInput);
  }

  /*
    sets auto focus on visibility change
  */
  componentDidUpdate() {
    const { props } = this;
    if (props.addFolderVisible) {
      this.subfolderInput.focus();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._clickedOffInput);
  }

  /**
  *  @param {Object} evt
  *  clears state on click other subfolders
  *  @return {}
  */
  _clickedOffInput = (evt) => {
    const { props } = this;
    if ((evt.target.getAttribute('data-click-id') !== 'addFolder')
      && (props.addFolderVisible || (props.addFolderVisible === undefined))) {
      this._clearState();

      if (props.setAddFolderVisible) {
        props.setAddFolderVisible(false);
      }
    }
  }

  /**
  *  @param {string} key - key for the state object
  *  @param {boolean} value - value for key
  *  sets state on a boolean value
  *  @return {}
  */
  _updateStateBoolean = (key, value) => {
    this.setState({
      [key]: value,
    }, () => {
      this.subfolderInput.focus();
    });
  }

  /**
  *  @param {event}
  *  sets state on folderName
  *  triggers muation on enter
  *  triggers clear on escape
  *  @return {}
  */
  _updateFolderName = (evt) => {
    this.setState({
      folderName: evt.target.value,
    });

    if (evt.key === 'Enter') {
      this._triggerMutation();
    }

    if (evt.key === 'Escape') {
      this._clearState();
    }
  }

  /**
  *  @param {}
  *  sets state on a boolean value
  *  @return {}
  */
  _clearState = () => {
    this.setState({
      folderName: '',
      editMode: false,
    });

    if (this.subfolderInput) {
      this.subfolderInput.value = '';
    }
  }

  /**
  *  @param {}
  *  sets state on a boolean value
  *  @return {}
  */
  _clearInput = () => {
    this.setState({
      folderName: '',
    });

    this.subfolderInput.value = '';
  }

  /**
  *  @param {}
  *  trigger MakeLabbookDirectoryMutation
  *  @return {}
  */
  _triggerMutation = () => {
    const { props, state } = this;
    const data = {
      key: props.folderKey + state.folderName,
    };

    props.mutations.makeLabbookDirectory(data, () => {
      this._clearState();
      if (props.setAddFolderVisible) {
        props.setAddFolderVisible(false);
      }
    });
  }

  render() {
    const { props, state } = this;

    // decalre css here
    const subfolderInputCSS = classNames({
      'AddSubfolder__edit Input--clear': true,
      hidden: !state.editMode && !props.addFolderVisible,
    });
    const addFolderCSS = classNames({
      AddSubfolder: true,
      hidden: !props.addFolderVisible,
    });
    const subfolderTextCSS = classNames({
      AddSubfolder__text: true,
      hidden: (state.editMode) || props.addFolderVisible,
    });

    return (
      <div
        onClick={() => { this._updateStateBoolean('editMode', true); }}
        style={props.rowStyle}
        className={addFolderCSS}
        role="presentation"
        data-click-id="addFolder"
      >
        <div className={subfolderTextCSS}>
            Add Folder
        </div>
        <div className={subfolderInputCSS}>
          <div className="AddSubfolder__container">
            <input
              ref={(input) => { this.subfolderInput = input; }}
              placeholder="Enter Folder Name"
              type="text"
              className="AddSubfolder__input"
              maxLength="255"
              onKeyUp={(evt) => { this._updateFolderName(evt); }}
              data-click-id="addFolder"
            />
            { (state.folderName.length > 0)
              && (
                <button
                  type="button"
                  className="Btn--noShadow Btn Btn--flat"
                  onClick={() => { this._clearInput(); }}
                  data-click-id="addFolder"
                >
                  Clear
                </button>
              )
            }
          </div>
        </div>
        <div className="flex justify--space-around">
          <button
            type="button"
            className="File__btn--round File__btn--cancel"
            onClick={() => props.setAddFolderVisible(false)}
          />
          <button
            type="button"
            className="File__btn--round File__btn--add"
            onClick={() => { this._triggerMutation(); }}
          />
        </div>
      </div>
    );
  }
}

export default AddSubfolder;
