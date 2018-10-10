import React, { Component } from 'react';
import classNames from 'classnames';
import { DragSource, DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
// assets
import './AddSubfolder.scss';
// components
import Connectors from './Connectors';


class AddSubfolder extends Component {
  constructor(props) {
      super(props);

      this.state = {
        editMode: false,
        folderName: '',
      };

      this._clickedOffInput = this._clickedOffInput.bind(this);
  }
  componentDidMount() {
    window.addEventListener('click', this._clickedOffInput);
  }
  componentWillUnmount() {
    window.removeEventListener('click', this._clickedOffInput);
  }

  /**
  *  @param {event}
  *  clears state on click other subfolders
  *  @return {}
  */
  _clickedOffInput(evt) {
    if (!(evt.target.className.indexOf('AddSubfolder') > -1)) {
      this._clearState();
    }
  }
  /**
  *  @param {string, boolean}
  *  sets state on a boolean value
  *  @return {}
  */
  _updateStateBoolean(key, value) {
    this.setState({
      [key]: value,
    });
    this.subfolderInput.focus();
  }
  /**
  *  @param {event}
  *  sets state on folderName
  *  triggers muation on enter
  *  triggers clear on escape
  *  @return {}
  */
  _updateFolderName(evt) {
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
  _clearState() {
    this.setState({
      folderName: '',
      editMode: false,
    });

    this.subfolderInput.value = '';
  }

  /**
  *  @param {}
  *  sets state on a boolean value
  *  @return {}
  */
  _clearInput() {
    this.setState({
      folderName: '',
    });

    this.subfolderInput.value = '';
  }

  /**
  *  @param {string, boolean}
  *  sets state on a boolean value
  *  @return {}
  */
  _triggerMutation() {
    const data = {
      key: this.props.folderKey + this.state.folderName,
    };

    this.props.mutations.makeLabbookDirectory(data, (response) => {
       this._clearState();
    });
  }

  render() {
    const subfolderTextCSS = classNames({
            AddSubfolder__text: true,
            hidden: this.state.editMode,
          }),
          subfolderInputCSS = classNames({
            AddSubfolder__edit: true,
            hidden: !this.state.editMode,
          });


    return (
      <div
          onClick={() => { this._updateStateBoolean('editMode', true); }}
          className="AddSubfolder">
          <div className={subfolderTextCSS}>
            Add Subfolder
          </div>
           <div className={subfolderInputCSS}>
             <div className="AddSubfolder__container">
               <input
                 ref={(input) => { this.subfolderInput = input; }}
                 placeholder="Add Subfolder"
                 type="text"
                 className="AddSubfolder__input"
                 onKeyUp={(evt) => { this._updateFolderName(evt); }}
               />
               { (this.state.folderName.length > 0) &&
                   <button
                     className="AddSubfolder__btn AddSubfolder__btn--clear"
                     onClick={() => { this._clearInput(); }}>
                     Clear
                   </button>
                 }
             </div>
             <button
               className="AddSubfolder__btn AddSubfolder__btn--add"
               onClick={() => { this._triggerMutation(); }}
             />
          </div>
      </div>
    );
  }
}

export default AddSubfolder;
