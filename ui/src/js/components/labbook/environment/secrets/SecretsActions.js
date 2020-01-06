// @flow
// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// store
import { setErrorMessage } from 'JS/redux/actions/footer';
// assets
import './SecretsActions.scss';

type Props = {
  editSecret: Function,
  filename: string,
  isEditing: boolean,
  id: string,
  name: string,
  owner: string,
  secretsMutations: {
    removeSecret: Function,
    deleteSecret: Function,
  }
}

class SecretsAction extends Component<Props> {
  state = {
    popupVisible: false,
  }

  /**
  *  @param {}
  *  triggers delete secret mutation
  *  @return {}
  */
  _deleteSecret = () => {
    const {
      filename,
      id,
      name,
      owner,
      secretsMutations,
    } = this.props;
    const data = {
      filename,
      id,
    };

    const deleteCallback = (response, error) => {
      if (error) {
        setErrorMessage(owner, name, 'An error occured while attempting to delete secrets file', error);
      }
    };

    const removeCallback = () => {
      secretsMutations.removeSecret(data, deleteCallback);
    };

    secretsMutations.deleteSecret(data, removeCallback);
  }

  /**
  *  @param {Obect} evt
  *  @param {boolean} popupVisible - boolean value for hiding and showing popup state
  *  triggers favoirte unfavorite mutation
  *  @return {}
  */
  _togglePopup(evt, popupVisible) {
    if (!popupVisible) {
      /**
       * only stop propagation when closing popup,
       * other menus won't close on click if propagation is stopped
       */
      evt.stopPropagation();
    }
    this.setState({ popupVisible });
  }

  render() {
    const {
      editSecret,
      filename,
      isEditing,
    } = this.props;
    const { popupVisible } = this.state;
    const popupCSS = classNames({
      SecretsActions__popup: true,
      hidden: !popupVisible || isEditing,
      Tooltip__message: true,
    });
    return (
      <div className="SecretsAction flex justify--space-around align-items--end">
        <div className="relative">
          <button
            className="Btn Btn--medium Btn--noMargin Btn--round Btn__delete-secondary Btn__delete-secondary--medium"
            type="button"
            onClick={(evt) => { this._togglePopup(evt, true); }}
            disabled={isEditing}
          />
          <div className={popupCSS}>
            <div className="Tooltip__pointer" />
            <p className="margin-top--0">Are you sure?</p>
            <div className="flex justify--space-around">
              <button
                className="Secrets__btn--round Secrets__btn--cancel"
                onClick={(evt) => { this._togglePopup(evt, false); }}
                type="button"
              />
              <button
                className="Secrets__btn--round Secrets__btn--add"
                onClick={this._deleteSecret}
                type="button"
              />
            </div>
          </div>
        </div>
        <button
          className="Btn Btn--medium Btn--noMargin Btn--round Btn__edit-secondary Btn__edit-secondary--medium"
          type="button"
          onClick={() => editSecret(filename)}
        />
      </div>
    );
  }
}

export default SecretsAction;
