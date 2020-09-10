// @flow
// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// store
import { setUpdateHistoryView } from 'JS/redux/actions/footer';
// componenets
import FooterMessage from './FooterMessage';
// assets
import './FooterNotificationList.scss';
import './FooterMessage.scss';

type Props = {
  parentState: {
    helperVisible: boolean,
    messageListOpen: boolean,
    messageStack: Array,
    messageStackHistory: Array,
    viewHistory: boolean,
  },
  toggleMessageList: Function,
}

type State = {
  selectedBuildId: string,
  messageBodyOpenCount: number,
}

/**
*  @param {Array} messageList
*  @param {Array} messageListOpenItems
*  sets selectedBuildId in state
*/
const getHeight = (messageList, messageListOpenItems) => {
  let height = (messageList.length > 6) ? 260 : messageList.length * 60;
  height = (messageListOpenItems > 0) ? 'auto' : height;
  height = (height === 'auto') ? 'auto' : `${height}px`;
  return height;
};

class FooterNotificationList extends Component<Props, State> {
  state = {
    selectedBuildId: '',
    messageBodyOpenCount: 0,
  }

  /**
  *  @param {Boolean} messageBodyVisible
  *  updates count of open items in the menu
  */
  _updateOpenCount = (messageBodyVisible) => {
    this.setState((state) => {
      const value = messageBodyVisible ? 1 : -1;
      const messageBodyOpenCount = state.messageBodyOpenCount + value;
      return {
        ...state,
        messageBodyOpenCount,
      };
    });
  }

  /**
  *  @param {Boolean} selectedBuildId
  *  sets selectedBuildId in state
  */
  _setBuildId = (selectedBuildId) => {
    const { toggleMessageList } = this.props;
    this.setState({ selectedBuildId });

    toggleMessageList();
  }

  render() {
    const { messageBodyOpenCount, selectedBuildId } = this.state;
    const { parentState } = this.props;
    const {
      helperVisible,
      messageListOpen,
      messageStack,
      messageStackHistory,
      viewHistory,
    } = parentState;
    const messageList = viewHistory
      ? messageStackHistory
      : messageStack;
    console.trace(messageList, viewHistory);
    const height = getHeight(messageList, messageBodyOpenCount);
    // declare css here
    const footerMessageSectionClass = classNames({
      Footer__messageContainer: true,
      'Footer__messageContainer--collapsed': !messageListOpen,
      'Footer__messageContainer--helper-open': helperVisible,
    });
    const footerMessageListClass = classNames({
      Footer__messageList: true,
      'Footer__messageList--collapsed': !messageListOpen,
    });
    const viewAllButtonClass = classNames({
      'Btn Btn--feature Btn--feature--expanded Btn--feature--noPadding': true,
      hidden: (viewHistory || !messageListOpen),
    });

    return (
      <div className={footerMessageSectionClass}>
        <button
          type="button"
          className={viewAllButtonClass}
          onClick={() => setUpdateHistoryView()}
        >
          View All
        </button>
        <div
          className={footerMessageListClass}
          style={{ height }}
        >
          <ul>
            {
              messageList.map(messageItem => (
                <FooterMessage
                  key={messageItem.id}
                  messageItem={messageItem}
                  selectedBuildId={selectedBuildId}
                  owner={messageItem.owner}
                  name={messageItem.name}
                  setBuildId={this._setBuildId}
                  updateOpenCount={this._updateOpenCount}
                />
              ))
            }

            { (messageList.length === 0)
              && (
                <li className="FooterMessage">
                  <div className="FooterMessage__body">
                    <div className="FooterMessage__flex">
                      <div className="FooterMessage__item">
                        <p className="FooterMessage__title">No Notifications</p>
                      </div>
                    </div>
                  </div>
                </li>
              )
            }
          </ul>
        </div>
      </div>
    );
  }
}

export default FooterNotificationList;
