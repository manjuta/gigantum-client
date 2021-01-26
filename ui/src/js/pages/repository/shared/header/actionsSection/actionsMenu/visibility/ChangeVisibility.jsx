// @flow
// vendor
import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import VisibilityModal from 'Pages/repository/shared/modals/visibility/VisibilityModal';
// css
import './ChangeVisibility.scss';

type Props = {
  defaultRemote: string,
  name: string,
  owner: string,
  isLocked: boolean,
  remoteUrl: string,
  visibility: string,
};

class ChangeVisibility extends Component<Props> {
  state ={
    visibilityModalVisible: false,
  }

  /**
  *  @param {}
  *  copies remote
  *  @return {}
  */
  _toggleModal = () => {
    this.setState((state) => {
      const visibilityModalVisible = !state.visibilityModalVisible;
      return { visibilityModalVisible };
    });
  }

  render() {
    const {
      defaultRemote,
      remoteUrl,
      visibility,
      isLocked,
    } = this.props;
    const { visibilityModalVisible } = this.state;

    const doesNotHaveRemote = (defaultRemote === null) && (remoteUrl === null);


    return (
      <li
        className="ChangeVisibility"
        data-tip="Project needs to be published before its visibility can be changed"
        data-for="Tooltip--noCache"
      >
        <div className={`ActionsMenu__item ChangeVisibility--visibility-${visibility}`}>

          <button
            disabled={doesNotHaveRemote || isLocked}
            onClick={() => this._toggleModal('visibilityModalVisible')}
            className="ActionsMenu__btn--flat"
            type="button"
          >
            Change Visibility
          </button>

          <VisibilityModal
            {...this.props}
            isVisible={visibilityModalVisible}
            toggleModal={this._toggleModal}
            buttonText="Save"
            header="Change Visibility"
            modalStateValue="visibilityModalVisible"
          />

        </div>

        { doesNotHaveRemote
          && (
            <ReactTooltip
              place="top"
              id="Tooltip--noCache"
              delayShow={500}
            />
          )}
      </li>
    );
  }
}

export default ChangeVisibility;
