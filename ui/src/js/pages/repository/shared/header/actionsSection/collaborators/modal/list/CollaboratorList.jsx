// @flow
// component
import React, { PureComponent } from 'react';
import classNames from 'classnames';
// components
import CollaboratorsRow from './CollaboratorsRow';
import NoCollaborators from './NoCollaborators';

type Props = {
  collaborators: Array<Object>,
  currentServer: {
    backupInProgress: boolean,
  },
  overflow: boolean,
  toggleCollaborators: Function,
};

class CollaboratorList extends PureComponent<Props> {
  render() {
    const {
      collaborators,
      currentServer,
      overflow,
      toggleCollaborators,
    } = this.props;
    const {
      backupInProgress,
    } = currentServer;
    // declare css here
    const collaboratorList = classNames({
      CollaboratorsModal__list: true,
      'CollaboratorsModal__list--overflow': overflow,
    });

    if (collaborators && (collaborators.length > 0) && !backupInProgress) {
      return (
        <div className="CollaboratorsModal__listContainer">
          <ul className={collaboratorList}>
            { collaborators.map(collaborator => (
              <CollaboratorsRow
                {...this.props}
                key={collaborator.username}
                collaborator={collaborator}
              />
            ))}
          </ul>
        </div>
      );
    }

    if (backupInProgress) {
      return (
        <div className="CollaboratorsModal__container">
          <h2>Backup In Progress</h2>
          <p>Collaborators cannot be viewed or changed while backup is in progress</p>
        </div>
      );
    }

    return (
      <NoCollaborators
        collaborators={collaborators}
        toggleCollaborators={toggleCollaborators}
      />
    );
  }
}

export default CollaboratorList;
