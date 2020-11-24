// @flow
// vendor
import React, { PureComponent } from 'react';
// redux
import { setPublishFromCollaborators } from 'JS/redux/actions/shared/collaborators/collaborators';
// context
import ServerContext from 'Pages/ServerContext';
// css
import './NoCollaborators.scss';

type Props = {
  collaborators: Array<Object>,
  toggleCollaborators: Function,
}

class NoCollaborators extends PureComponent<Props> {
  /**
   * @param {} -
   * triggers publish modal
   */
  _pusblishModal = () => {
    const { toggleCollaborators } = this.props;
    toggleCollaborators();
    setPublishFromCollaborators(true);

    setTimeout(() => {
      setPublishFromCollaborators(false);
    }, 100);
  }

  static contextType = ServerContext;

  render() {
    const { collaborators } = this.props;
    const { currentServer } = this.context;

    if (collaborators && collaborators.length) {
      return (
        <div className="CollaboratorsModal__message">
          To add and edit collaborators,
          <b>{' Administrator '}</b>
          access is required. Contact the Project
          <b>{' Owner '}</b>
          or a Project
          <b>{' Administrator '}</b>
          to manage collaborator settings.
        </div>
      );
    }

    return (
      <div className="NoCollaborators">
        <div className="NoCollaborators__container flex flex--column">
          <div>
            <p>To add collaborators, you must first “publish” this Project.</p>
            <p>
              Publishing uploads the Project to
              {` ${currentServer.name} `}
              so that it can be downloaded in another Client.
            </p>
          </div>
          <p className="NoCollaborators__p--margin">You can set the Project to be public or private when publishing.</p>
        </div>
        <div className="NoCollaborators__container">
          <button
            className="Btn Btn--inverted NoCollaborators__button--publish"
            onClick={() => { this._pusblishModal(); }}
            type="button"
          >
            Publish
          </button>
        </div>
      </div>
    );
  }
}

export default NoCollaborators;
