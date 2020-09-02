// @flow
// vendor
import React, { PureComponent } from 'react';
// Assets
import './SecretsEditing.scss';

type Props = {
  addedFiles: Array,
  editSecret: Function,
  node: {
    filename: string,
  },
  nodeMissing: boolean,
  replaceFile: Function,
  setFile: Function,
}

class SecretsEditing extends PureComponent<Props> {
  render() {
    const {
      node,
      addedFiles,
      setFile,
      replaceFile,
      editSecret,
      nodeMissing,
    } = this.props;

    const buttonText = nodeMissing ? 'Upload Missing File' : 'Replace File...';

    return (
      <div className="SecretsEditing flex">
        <label
          htmlFor="update_secret"
          className="SecretsTable__label"
        >
          <div
            className="Btn Btn--allStyling Btn--noMargin Btn--action padding--horizontal"
          >
            {buttonText}
          </div>
          <input
            id="update_secret"
            className="hidden"
            type="file"
            onChange={evt => setFile(node, evt.target.files[0])}
          />
        </label>
      </div>
    );
  }
}

export default SecretsEditing;
