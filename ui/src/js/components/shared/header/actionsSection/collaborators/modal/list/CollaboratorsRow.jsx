// @flow
// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// store
import { setErrorMessage } from 'JS/redux/actions/footer';
// components
import ButtonLoader from 'Components/common/ButtonLoader';
// css
import './CollaboratorsRow.scss';

type Props = {
  canManageCollaborators: boolean,
  collaborator: {
    collaboratorUsername: string,
    permission: boolean,
  },
  getPermissions: Function,
  mutations: {
    addCollaborator: Function,
    deleteCollaborator: Function,
  },
  name: string,
  owner: string,
  sectionType: string,
}

class CollaboratorsRow extends Component<Props> {
  state = {
    buttonState: '',
    menuOpen: false,
  }

  componentDidMount() {
    window.addEventListener('click', this._closePermissionsMenu);
  }

  /**
    * @param {} -
    * fires when component unmounts
    * removes added event listeners
  */
  componentWillUnmount() {
    window.removeEventListener('click', this._closePermissionsMenu);
  }


  /**
    *  @param {event} evt
    *  closes permission menu
    *  @return {}
    */
  _closePermissionsMenu = (evt) => {
    if (this.permissionsRef && !this.permissionsRef.contains(evt.target)) {
      this.setState({ menuOpen: false });
    }
  }

  /**
  *  @param {object} params
  *  deletes collaborators using mutation
  *  @return {}
  */
  _removeCollaborator = (evt, data) => {
    const {
      mutations,
      name,
      owner,
    } = this.props;
    const { collaborator, button } = data.params;
    const mutationData = {
      collaborator,
    };

    if (button) {
      button.disabled = true;
    }

    this.setState({ buttonState: 'loading' });
    // TODO remove duplicate code
    mutations.deleteCollaborator(
      mutationData,
      (response, error) => {
        if (button) {
          button.disabled = false;
        }

        if (error) {
          setErrorMessage(owner, name, 'Could not remove collaborator', error);

          this.setState({ buttonState: 'error' });
        } else {
          this.setState({ buttonState: 'finished' });
        }

        setTimeout(() => {
          this.setState({ buttonState: '' });
        }, 2000);
      },
    );
  }

  /**
  *  @param {string} newPermissions
  *  @param {string} collaboratorName
  *  deletes collaborators using mutation
  *  @return {}
  */
  _updatePermissions = (newPermissions, collaboratorName) => {
    const {
      mutations,
    } = this.props;
    const mutationData = {
      collaboratorName,
      newPermissions,
    };

    this.setState({
      buttonState: 'loading',
      menuOpen: false,
    });

    mutations.addCollaborator(
      mutationData,
      (response, error) => {
        if (error) {
          this.setState({ buttonState: 'error' });
        } else {
          this.setState({ buttonState: 'finished' });
        }

        setTimeout(() => {
          this.setState({ buttonState: '' });
        }, 2000);
      },
    );
  }

  /**
  *  @param {} -
  *  toggles permissions menu
  *  @return {}
  */
  _togglePermissionsMenu = () => {
    this.setState((state) => {
      const menuOpen = !state.menuOpen;
      return {
        ...state,
        menuOpen,
      };
    });
  }

  render() {
    const {
      canManageCollaborators,
      collaborator,
      getPermissions,
      owner,
      sectionType,
    } = this.props;
    const {
      buttonState,
      menuOpen,
    } = this.state;

    const collaboratorName = collaborator.collaboratorUsername;
    const username = localStorage.getItem('username');
    const isUser = collaboratorName === username;
    const disableButtonLoader = collaboratorName === localStorage.getItem('username') || !canManageCollaborators || (collaboratorName === owner);
    // decalre css here
    const collaboratorItemCSS = classNames({
      'CollaboratorsModal__item CollaboratorsModal__item--me': isUser,
      CollaboratorsModal__item: !isUser,
    });
    const individualPermissionsSelectorCSS = classNames({
      CollaboratorModal__PermissionsSelector: true,
      'CollaboratorModal__PermissionsSelector--individual': true,
      'CollaboratorModal__PermissionsSelector--open': menuOpen,
      'CollaboratorModal__PermissionsSelector--disabled': isUser
        || !canManageCollaborators
        || (collaboratorName === owner),
      'CollaboratorModal__PermissionsSelector--collapsed': !menuOpen,
    });
    const individualPermissionsMenuCSS = classNames({
      'CollaboratorModal__PermissionsMenu box-shadow': true,
      'CollaboratorModal__PermissionsMenu--individual': true,
      hidden: !menuOpen,
    });

    return (
      <li
        key={collaboratorName}
        ref={collaboratorName}
        className={collaboratorItemCSS}
      >
        <div className="CollaboratorsModal__collaboratorName">
          {collaboratorName}
        </div>

        <div
          className="CollaboratorsModal__permissions CollaboratorsModal__permissions--individual CollaboratorsModal__permissions--small"
          ref={(ref) => { this.permissionsRef = ref; }}
        >
          <span
            role="presentation"
            className={individualPermissionsSelectorCSS}
            onClick={() => this._togglePermissionsMenu()}
          >
            {getPermissions(collaborator.permission, collaboratorName)}
          </span>
          <ul className={individualPermissionsMenuCSS}>
            <li
              role="presentation"
              onClick={() => this._updatePermissions('readonly', collaboratorName)}
            >
              <div className="CollaboratorsModal__permissions-header">Read</div>
              <div className="CollaboratorsModal__permissions-subtext">Read-only permissions. Can only pull updates</div>
            </li>
            {
              (sectionType !== 'dataset')
              && (
              <li
                role="presentation"
                onClick={() => this._updatePermissions('readwrite', collaboratorName)}
              >
                <div className="CollaboratorsModal__permissions-header">Write</div>
                <div className="CollaboratorsModal__permissions-subtext">Read/Write permissions. Can sync to branches other than master</div>
              </li>
              )
            }
            <li
              role="presentation"
              onClick={() => this._updatePermissions('owner', collaboratorName)}
            >
              <div className="CollaboratorsModal__permissions-header">Admin</div>
              <div className="CollaboratorsModal__permissions-subtext">Admin permissions. Can sync to master and managed collaborators</div>
            </li>
          </ul>
        </div>

        <ButtonLoader
          ref={collaboratorName}
          buttonState={buttonState}
          buttonText=""
          className="ButtonLoader__collaborator Btn__delete Btn--round Btn--bordered"
          params={{ collaborator: collaboratorName, button: this }}
          buttonDisabled={disableButtonLoader}
          clicked={this._removeCollaborator}
        />

      </li>
    );
  }
}

export default CollaboratorsRow;
