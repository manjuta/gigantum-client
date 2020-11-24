// @flow
// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
// redux
import { setPauseUpload } from 'JS/redux/actions/shared/fileBrowser/fileBrowserWrapper';
import * as footerActionsRedux from 'JS/redux/actions/footer';
// components
import FooterNotificationList from './FooterNotificationList';
import FooterUploadBar from './FooterUploadBar';
// assets
import './Footer.scss';


type Props = {
  helperVisible: boolean,
  history: Object,
  footerActions: {
    setRemoveMessage: Function,
    setResetFooter: Function,
    setResizeFooter: Function,
    setToggleMessageList: Function,
    setUpdateHistoryStackItemVisibility: Function,
    setUpdateMessageStackItemVisibility: Function,
    setUploadMessageRemove: Function,
  },
  labbookName: string,
  messageListOpen: boolean,
  open: boolean,
  uploadOpen: boolean,
  viewHistory: boolean,
}

class Footer extends Component<Props> {
  /**
    subscribe to store to update state
  */
  componentDidMount() {
    window.addEventListener('resize', this._resize);
  }

  componentDidUpdate() {
    const {
      messageListOpen,
      viewHistory,
      footerActions,
    } = this.props;
    const setTimeoutFunc = () => {
      this.timeout = setTimeout(() => {
        footerActions.setToggleMessageList(false, true);
      }, 10 * 1000);
    };

    if (messageListOpen && !viewHistory && !this.timeout) {
      setTimeoutFunc();
    } else if (this.timeout && (messageListOpen && !viewHistory)) {
      clearTimeout(this.timeout);
      this.timeout = null;
      setTimeoutFunc();
    } else {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  /**
    unsubscribe from event listeners
  */
  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  /**
    @param {} -
    opens project in view
  */
  _openLabbook = () => {
    const {
      history,
      labbookName,
    } = this.props;
    this._clearState();
    history.replace(`/projects/${labbookName}`);
  }

  /**
    @param {}
    add scroll listener to pop up footer
  */
  _clearState = () => {
    const { footerActions } = this.props;
    document.getElementById('footerProgressBar').style.opacity = 0;

    footerActions.setResetFooter();

    setTimeout(() => {
      document.getElementById('footerProgressBar').style.width = '0%';
      setTimeout(() => {
        document.getElementById('footerProgressBar').style.opacity = 1;
      }, 1000);
    }, 1000);
  }

  /**
   @param {}
   stops user and pops a modal prompting them to cancel continue or save changes
  */
  _pauseUpload = () => {
    setPauseUpload(true);
  }

  /**
    @param {}
    gets upload message which tracks progess
  */
  _closeFooter = () => {
    const { footerActions } = this.props;
    footerActions.setUploadMessageRemove('', '', 0);
  }

  /**
    @param {object} messageItem
    gets upload message which tracks progess
  */
  _removeMessage = (messageItem) => {
    const { footerActions } = this.props;
    footerActions.setRemoveMessage(messageItem.id);
  }

  /**
    @param {}
    toggles messages list to collapsed or expanded
    updates redux store
    @return {}
  */
  _toggleMessageList = () => {
    const { footerActions, messageListOpen } = this.props;
    footerActions.setToggleMessageList(!messageListOpen, true);
  }

  /**
    @param {number}
    toggles view of message body for a stack item
    updates redux store
    @return {}
   */
  _showMessageBody = (index) => {
    const { footerActions } = this.props;
    const {
      viewHistory,
    } = this.props;
    if (!viewHistory) {
      footerActions.setUpdateMessageStackItemVisibility(index);
    } else {
      footerActions.setUpdateHistoryStackItemVisibility(index);
    }
  }

  /**
    * @param {}
    * update store to risize component
  */
  _resize = () => {
    const { footerActions } = this.props;
    footerActions.setResizeFooter();
  }

  render() {
    const {
      helperVisible,
      messageListOpen,
      open,
      uploadOpen,
    } = this.props;
    const bodyWidth = document.body.clientWidth;

    const footerClass = classNames({
      Footer: true,
      'Footer--uploading': uploadOpen,
      'Footer--expand': (open) || uploadOpen,
      'Footer--expand-extra': (open && uploadOpen),

    });
    const footerButtonClass = classNames({
      'Footer__disc-button': true,
      'Footer__disc-button--open': messageListOpen,
      'Footer__dist-button--side-view': bodyWidth < 1600,
      'Footer__disc-button--helper-open': helperVisible,
      'Footer__disc-button--bottom': !messageListOpen && uploadOpen,
    });

    return (
      <div className="Footer__container">
        <div id="footer" className={footerClass}>

          <FooterNotificationList
            showMessageBody={this._showMessageBody}
            parentState={this.props}
            toggleMessageList={this._toggleMessageList}
          />

          <FooterUploadBar
            closeFooter={this._closeFooter}
            openLabbook={this._openLabbook}
            parentState={this.props}
          />

          <button
            type="button"
            onClick={() => this._toggleMessageList()}
            className={footerButtonClass}
          />

        </div>
      </div>
    );
  }
}

const mapStateToProps = state => state.footer;

const mapDispatchToProps = () => ({
  footerActions: footerActionsRedux,
});

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
