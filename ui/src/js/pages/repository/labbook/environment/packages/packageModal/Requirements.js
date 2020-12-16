// @flow
// vendor
import React, { Component } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
// store
import { setErrorMessage } from 'JS/redux/actions/footer';
// assets
import './Requirements.scss';

type Props = {
  connectDropTarget: Function,
  isOver: bool,
  name: string,
  owner: string,
  queuePackage: Function,
}

class Requirements extends Component<Props> {
  state = {
    rejectedPackages: [],
    droppedFile: null,
    fileParsing: false,
  }

  /**
  *  @param {Object} file
  *  parses requirements file
  *  @return {}
  */
  _parseFile = (file) => {
    const {
      name,
      owner,
      queuePackage,
    } = this.props;
    const { droppedFile } = this.state;
    const self = this;
    const reader = new FileReader();

    if (!droppedFile) {
      if (file.type === 'text/plain') {
        this.setState({ droppedFile: file.name, fileParsing: true });

        reader.onload = (evt) => {
          const rejectedPackages = [];
          const packages = evt.target.result.split('\n').filter(line => (line[0] !== '#') && (line !== ''));

          packages.forEach((pkg) => {
            const trimmedPackage = pkg.trim();
            const splitPackage = trimmedPackage.split('==');
            if (/ |\[| \]|=/.test(splitPackage[0])) {
              rejectedPackages.push(trimmedPackage);
            } else {
              const packageData = {
                manager: 'pip',
                package: splitPackage[0],
                version: splitPackage[1],
              };
              queuePackage(packageData);
            }
            self.setState({
              rejectedPackages,
              droppedFile: file.name,
              fileParsing: false,
            });
          });
        };
        reader.readAsText(file);
      } else {
        setErrorMessage(owner, name, 'Requirements file must be a text file');
      }
    }
  }

  render() {
    const { isOver, connectDropTarget } = this.props;
    const {
      droppedFile,
      fileParsing,
      rejectedPackages,
    } = this.state;
    const subText = isOver ? '' : 'or';
    // declare css here
    const dropBoxCSS = classNames({
      'Dropbox flex flex--column align-items--center': true,
      'Dropbox--hovered': isOver,
    });
    const fileDroppedCSS = classNames({
      'Requirements__dropped-file Card Card--no-hover Card--requirements': true,
      'Requirements__dropped-file--loading': fileParsing,
    });

    return connectDropTarget(
      <div className="Requirements__file flex justify--center">
        {
          !droppedFile
          && (
          <div
            className={dropBoxCSS}
          >
            <div className="Dropbox--menu">
              Drag and drop pip requirements.txt file here
              <br />
              {subText}
            </div>
            {
              !isOver
              && (
              <label
                htmlFor="requirements_upload"
                className="Requirements__label"
              >
                <div
                  className="Btn Btn--allStyling"
                >
                  Choose Files...
                </div>
                <input
                  id="requirements_upload"
                  className="hidden"
                  type="file"
                  onChange={evt => this._parseFile(evt.target.files[0])}
                />
              </label>
              )
            }
          </div>
          )
        }
        {
          droppedFile
          && (
          <div className={fileDroppedCSS}>
            <div className="Requirements__file-name">
              {droppedFile}
            </div>
            {
              rejectedPackages.length > 0 && (
              <div className="Requirements__rejectedPackages">
                <p>Gigantum currently requires that all packages are pinned to a specific version.</p>

                <p>The following packages could not be installed as specified and must be manually added.</p>
                {
                  rejectedPackages.map(rejectedPackage => (
                    <div
                      className="Requirements__rejected-package"
                      key={rejectedPackage}
                    >
                      {rejectedPackage}
                    </div>
                  ))
                }
              </div>
              )
            }
          </div>
          )
        }
      </div>,
    );
  }
}

const fileTarget = {
  drop(props, monitor, component) {
    if (monitor.getItem().files.length === 1) {
      component._parseFile(monitor.getItem().files[0]);
    }
  },
};


export default DropTarget(NativeTypes.FILE, fileTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(Requirements);
