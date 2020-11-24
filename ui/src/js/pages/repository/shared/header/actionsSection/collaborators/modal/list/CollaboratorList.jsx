// @flow
// component
import React, { PureComponent } from 'react';
import classNames from 'classnames';
// components
import CollaboratorsRow from './CollaboratorsRow';
import NoCollaborators from './NoCollaborators';

type Props = {
  collaborators: Array<Object>,
  overflow: boolean,
  toggleCollaborators: Function,
};

class CollaboratorList extends PureComponent<Props> {
  render() {
    const {
      collaborators,
      overflow,
      toggleCollaborators,
    } = this.props;
    // declare css here
    const collaboratorList = classNames({
      CollaboratorsModal__list: true,
      'CollaboratorsModal__list--overflow': overflow,
    });

    if (collaborators && (collaborators.length > 0)) {
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

    return (
      <NoCollaborators
        collaborators={collaborators}
        toggleCollaborators={toggleCollaborators}
      />
    );
  }
}

export default CollaboratorList;
