// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// components
import LoginPrompt from 'Components/shared/modals/LoginPrompt';
import Collaborators from './collaborators/Collaborators';
import ActionsMenu from './actionsMenu/ActionsMenu';

import './ActionsSection.scss';

type Props = {
  isSticky: boolean,
}

class ActionsSection extends Component<Props> {
  state = {
    showLoginPrompt: false,
  }

  /**
   * @param {} -
   * sets login prompt to true
   * @return {}
   */
  _showLoginPrompt = () => {
    this.setState({ showLoginPrompt: true });
  }

  /**
   * @param {} -
   * sets login prompt to false
   * @return {}
   */
  _closeLoginPromptModal = () => {
    this.setState({ showLoginPrompt: false });
  }

  render() {
    const { isSticky } = this.props;
    const { showLoginPrompt } = this.state;
    // declare css here
    const actionsSectionCSS = classNames({
      ActionsSection: true,
      hidden: isSticky,
    });

    return (

      <div className={actionsSectionCSS}>
        <Collaborators
          {...this.props}
          showLoginPrompt={this._showLoginPrompt}
        />
        <ActionsMenu
          {...this.props}
          showLoginPrompt={this._showLoginPrompt}
        />

        { showLoginPrompt
         && <LoginPrompt closeModal={this._closeLoginPromptModal} />
        }
      </div>
    );
  }
}

export default ActionsSection;
