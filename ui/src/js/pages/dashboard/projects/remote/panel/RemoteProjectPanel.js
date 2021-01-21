// vendor
import React, { Component } from 'react';
import uuidv4 from 'uuid/v4';
import Highlighter from 'react-highlight-words';
import classNames from 'classnames';
import Moment from 'moment';
// components
import RepositoryTitle from 'Pages/dashboard/shared/title/RepositoryTitle';
// muations
import ImportRemoteProjectMutation from 'Mutations/repository/import/ImportRemoteLabbookMutation';
import BuildImageMutation from 'Mutations/container/BuildImageMutation';
// store
import { setWarningMessage, setMultiInfoMessage } from 'JS/redux/actions/footer';
// queries
import UserIdentity from 'JS/Auth/UserIdentity';
// components
import LoginPrompt from 'Pages/repository/shared/modals/LoginPrompt';
import Loader from 'Components/loader/Loader';
// assets
import './RemoteProjectPanel.scss';

type Props = {
  edge: {
    node: {
      creationDateUtc: string,
      description: string,
      modifiedDateUtc: string,
      importUrl: string,
      name: string,
      owner: string,
      visibility: string,
    }
  },
  existsLocally: boolean,
  toggleDeleteModal: Function,
  filterText: string,
}

class RemoteProjectPanel extends Component<Props> {
  state = {
    isImporting: false,
    showLoginPrompt: false,
  };

  /**
    *  @param {}
    *  changes state of isImporting to false
  */
  _clearState = () => {
    if (document.getElementById('dashboard__cover')) {
      document.getElementById('dashboard__cover').classList.add('hidden');
    }
    this.setState({
      isImporting: false,
    });
  }

  /**
    *  @param {}
    *  changes state of isImporting to true
  */
  _importingState = () => {
    document.getElementById('modal__cover').classList.remove('hidden');
    document.getElementById('loader').classList.remove('hidden');
    this.setState({
      isImporting: true,
    });
  }

  /**
    *  @param {owner, projectName}
    *  imports project from remote url, builds the image, and redirects to imported project
    *  @return {}
  */
  _importProject = (owner, projectName) => {
    // TODO break up this function
    const { edge } = this.props;
    const self = this;
    const id = uuidv4();
    const remote = edge.node.importUrl;

    UserIdentity.getUserIdentity().then((response) => {
      if (navigator.onLine) {
        if (response.data) {
          if (response.data.userIdentity.isSessionValid) {
            this._importingState();
            const messageData = {
              id,
              message: 'Importing Project please wait',
              isLast: false,
              error: false,
            };
            setMultiInfoMessage(owner, projectName, messageData);
            const successCall = () => {
              this._clearState();
              const mulitMessageData = {
                id,
                message: `Successfully imported remote Project ${projectName}`,
                isLast: true,
                error: false,
              };
              setMultiInfoMessage(owner, projectName, mulitMessageData);


              BuildImageMutation(
                owner,
                projectName,
                false,
                (response, error) => {
                  if (error) {
                    const buildMessageData = {
                      id,
                      owner,
                      name: projectName,
                      message: `ERROR: Failed to build ${projectName}`,
                      isLast: null,
                      error: true,
                      messageBody: error,
                    };
                    setMultiInfoMessage(owner, projectName, buildMessageData);
                  }
                },
              );

              self.props.history.replace(`/projects/${owner}/${projectName}`);
            };
            const failureCall = (error) => {
              this._clearState();
              const failureMessageData = {
                id,
                owner,
                name: projectName,
                message: 'ERROR: Could not import remote Project',
                isLast: null,
                error: true,
                messageBody: error,
              };
              setMultiInfoMessage(owner, projectName, failureMessageData);
            };
            self.setState({ isImporting: true });

            ImportRemoteProjectMutation(
              owner,
              projectName,
              remote,
              successCall,
              failureCall,
              (response, error) => {
                if (error) {
                  failureCall(error);
                }
                self.setState({ isImporting: false });
              },
            );
          } else {
            this.setState({ showLoginPrompt: true });
          }
        }
      } else {
        this.setState({ showLoginPrompt: true });
      }
    });
  }

  /**
   * @param {}
   * fires when user identity returns invalid session
   * prompts user to revalidate their session
   */
  _closeLoginPromptModal = () => {
    this.setState({
      showLoginPrompt: false,
    });
  }

  /**
   * @param {object} edge
   * validates user's session and then triggers toggleDeleteModal
   * which passes parameters to the DeleteLabbook component
  */
  _handleDelete = (edge) => {
    // TODO: move toggleDeleteModal
    const { existsLocally, toggleDeleteModal } = this.props;
    if (localStorage.getItem('username') !== edge.node.owner) {
      const { owner, name } = edge.node;
      setWarningMessage(owner, name, 'You can only delete remote Projects that you have created.');
    } else {
      UserIdentity.getUserIdentity().then((response) => {
        if (navigator.onLine) {
          if (response.data) {
            if (response.data.userIdentity.isSessionValid) {
              toggleDeleteModal({
                remoteId: edge.node.id,
                remoteUrl: edge.node.remoteUrl,
                remoteOwner: edge.node.owner,
                remoteLabbookName: edge.node.name,
                existsLocally,
              });
            } else {
              this.setState({ showLoginPrompt: true });
            }
          }
        } else {
          this.setState({ showLoginPrompt: true });
        }
      });
    }
  }


  render() {
    // variables declared here
    const { isImporting, showLoginPrompt } = this.state;
    const { edge, existsLocally, filterText } = this.props;
    const deleteDisabled = isImporting || (localStorage.getItem('username') !== edge.node.owner);
    const deleteTooltipText = (localStorage.getItem('username') !== edge.node.owner) ? 'Only owners and admins can delete a remote Project' : '';

    // css declared here
    const descriptionCss = classNames({
      'RemoteProjects__row RemoteProjects__row--text': true,
      blur: isImporting,
    });
    const deleteCSS = classNames({
      'Btn__dashboard Btn--action': true,
      'Tooltip-data Tooltip-data--wide': localStorage.getItem('username') !== edge.node.owner,
      'Btn__dashboard--delete': localStorage.getItem('username') === edge.node.owner,
      'Btn__dashboard--delete-disabled': localStorage.getItem('username') !== edge.node.owner,
    });

    return (
      <div
        key={edge.node.name}
        className="Card Card--225 column-4-span-3 flex flex--column justify--space-between"
      >
        <div className="RemoteProjects__row RemoteProjects__row--icon">
          { !(edge.node.visibility === 'local')
            && (
            <div
              data-tooltip={`${edge.node.visibility}`}
              className={`Tooltip-Listing RemoteProjects__${edge.node.visibility} Tooltip-data Tooltip-data--small`}
            />
            )
          }
          { existsLocally
            ? (
              <button
                type="button"
                className="Btn__dashboard Btn--action Btn__dashboard--cloud Btn__Tooltip-data"
                data-tooltip="This Project has already been imported"
                disabled
              >
                Imported
              </button>
            )
            : (
              <button
                type="button"
                disabled={isImporting}
                className="Btn__dashboard Btn--action Btn__dashboard--cloud-download"
                onClick={() => this._importProject(edge.node.owner, edge.node.name)}
              >
                Import
              </button>
            )
          }

          <button
            type="button"
            className={deleteCSS}
            data-tooltip={deleteTooltipText}
            disabled={deleteDisabled}
            onClick={() => this._handleDelete(edge)}
          >
            Delete
          </button>

        </div>

        <div className={descriptionCss}>

          <div className="RemoteProjects__row RemoteProjects__row--title">
            <RepositoryTitle
              action={() => {}}
              name={edge.node.name}
              section="RemoteProjects"
              filterText={filterText}
            />
          </div>

          <p className="RemoteProjects__paragraph RemoteProjects__paragraph--owner">{edge.node.owner}</p>
          <p className="RemoteProjects__paragraph RemoteProjects__paragraph--metadata">
            <span className="bold">Created:</span>
            {' '}
            {Moment(edge.node.creationDateUtc).format('MM/DD/YY')}
          </p>
          <p className="RemoteProjects__paragraph RemoteProjects__paragraph--metadata">
            <span className="bold">Modified:</span>
            {' '}
            {Moment(edge.node.modifiedDateUtc).fromNow()}
          </p>

          <p className="RemoteProjects__paragraph RemoteProjects__paragraph--description">
            { (edge.node.description && edge.node.description.length)
              ? (
                <Highlighter
                  highlightClassName="LocalProjects__highlighted"
                  searchWords={[filterText]}
                  autoEscape={false}
                  caseSensitive={false}
                  textToHighlight={edge.node.description}
                />
              )
              : 'No description provided'
           }
          </p>
        </div>

        { isImporting
          && (
            <div className="RemoteProjects__loader">
              <Loader />
            </div>
          )
        }

        <LoginPrompt
          showLoginPrompt={showLoginPrompt}
          closeModal={this._closeLoginPromptModal}
        />
      </div>
    );
  }
}

export default RemoteProjectPanel;
