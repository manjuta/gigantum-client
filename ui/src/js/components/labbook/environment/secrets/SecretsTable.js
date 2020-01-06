// @flow
// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// components
import SecretsAction from './SecretsActions';
import SecretsEditing from './SecretsEditing';
import SecretsPresent from './SecretsPresent';
// assets
import './SecretsTable.scss';

type Props = {
  secrets: {
    edges: Array<Object>,
  },
  secretsMutations: {
    deleteSecret: Function,
    uploadSecret: Function,
  }
}

class SecretsTable extends Component<Props> {
  state = {
    tooltipVisible: false,
    editedSecrets: new Set(),
    addedFiles: new Map(),
  }

  /**
    * @param {String} filename
    * sets tooltipVisible in state
    *
    * @return {}
  */
  _setTooltipVisible = (filename) => {
    this.setState((state) => {
      const tooltipVisible = (state.tooltipVisible === filename) ? null : filename;
      return { tooltipVisible };
    });
  }

  /**
    * @param {String} filename
    * sets editedSecrets in state
    *
    * @return {}
  */
  _editSecret = (filename) => {
    const { addedFiles, editedSecrets } = this.state;
    const newEditedSecrets = new Set(editedSecrets);
    const newAddedFiles = new Map(addedFiles);

    if (newEditedSecrets.has(filename)) {
      newEditedSecrets.delete(filename);
      newAddedFiles.delete(filename);
    } else {
      newEditedSecrets.add(filename);
    }
    this.setState({ addedFiles: newAddedFiles, editedSecrets: newEditedSecrets });
  }

  /**
  *  @param {String} filename
  *  @param {Obect} file
  * sets file in state
  */
  _setFile = (filename, file) => {
    const { addedFiles } = this.state;
    const newAddedFiles = new Map(addedFiles);
    newAddedFiles.set(filename, file);
    this.setState({ addedFiles: newAddedFiles });
  }

  /**
  *  @param {String} filename
  *  @param {String} path
  *  calls insert and upload file mutations
  *  @calls {props.secretsMutations.uploadSecret}
  *  @calls {props.secretsMutations.deleteSecret}
  */
  _replaceFile = (filename, id, isPresent) => {
    const { addedFiles } = this.state;
    const { secretsMutations } = this.props;

    let file = addedFiles.get(filename);
    file = new File([file], filename, { type: file.type });
    const uploadData = {
      file,
      filename,
      component: this,
      id,
    };

    const data = {
      filename,
      id,
    };
    if (isPresent) {
      const removeCallback = () => {
        secretsMutations.uploadSecret(uploadData);
      };
      secretsMutations.deleteSecret(data, removeCallback);
    } else {
      secretsMutations.uploadSecret(uploadData);
    }
    this._editSecret(filename);
  }

  render() {
    const { addedFiles, editedSecrets, tooltipVisible } = this.state;
    const { secrets } = this.props;
    const secretsArray = (secrets && secrets.edges)
      ? secrets.edges
      : [];

    return (
      <div className="Table Table--padded">
        <div className="Table__Header Table__Header--medium flex align-items--center">
          <div className="SecretsTable__header-file flex-1">Source File</div>
          <div className="SecretsTable__header-path flex-1">Destination Directory</div>
          <div className="SecretsTable__header-actions">Actions</div>
        </div>
        <div className="Table__Body">
          {
            secretsArray.map(({ node }) => {
              const isEditing = editedSecrets.has(node.filename);
              const nameCSS = classNames({
                'SecretsTable__row-file flex-1 break-word': true,
                'SecretsTable__row-file--missing': !node.isPresent,
                'SecretsTable__row-file--editing': isEditing,
              });
              return (
                <div
                  className="Table__Row Table__Row--secrets flex align-items--center"
                  key={node.id}
                >
                  <div className={nameCSS}>
                    {
                      !node.isPresent
                      && (
                        <SecretsPresent
                          setTooltipVisible={this._setTooltipVisible}
                          node={node}
                          tooltipVisible={tooltipVisible}
                        />
                      )
                    }

                    <div className="SecretsTable__name">
                      {node.filename}
                    </div>
                    {
                      isEditing
                      && (
                        <SecretsEditing
                          node={node}
                          addedFiles={addedFiles}
                          setFile={this._setFile}
                          replaceFile={this._replaceFile}
                          editSecret={this._editSecret}
                        />
                      )
                    }
                  </div>
                  <div className="SecretsTable__row-path flex-1 break-word">
                    {node.mountPath}
                  </div>
                  <div className="SecretsTable__row-actions">
                    <SecretsAction
                      {...node}
                      {...this.props}
                      editSecret={this._editSecret}
                      isEditing={isEditing}
                    />
                  </div>
                </div>
              );
            })

          }
          { (secretsArray.length === 0)
            && <p className="text-center">No secrets have been added to this project</p>
          }
        </div>
      </div>
    );
  }
}

export default SecretsTable;
