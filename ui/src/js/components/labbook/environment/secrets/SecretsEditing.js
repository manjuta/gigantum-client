// @flow
// vendor
import React, { PureComponent } from 'react';
// Assets
import './SecretsEditing.scss';

type Props = {
  node: {
    filename: string,
  },
  addedFiles: Array,
  setFile: Function,
  replaceFile: Function,
  editSecret: Function,
}

class SecretsEditing extends PureComponent<Props> {
  render() {
    const {
      node,
      addedFiles,
      setFile,
      replaceFile,
      editSecret,
    } = this.props;

    return (
      <div className="SecretsEditing flex">
        <label
          htmlFor="update_secret"
          className="SecretsTable__label"
        >
          <div
            className="Btn Btn--allStyling Btn--noMargin Btn--action padding--horizontal"
          >
            Replace File...
          </div>
          <input
            id="update_secret"
            className="hidden"
            type="file"
            onChange={evt => setFile(node.filename, evt.target.files[0])}
          />
        </label>
        <button
          type="button"
          className="Btn Btn--small Btn__check--grey Btn--round"
          disabled={!addedFiles.has(node.filename)}
          onClick={() => replaceFile(node.filename, node.id, node.isPresent)}
        />
        <button
          type="button"
          className="Btn Btn--small Btn__close--grey Btn--round"
          onClick={() => editSecret(node.filename)}
        />
      </div>
    );
  }
}

export default SecretsEditing;
