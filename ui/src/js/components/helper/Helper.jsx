// @flow
// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
// store
import {
  setHelperVisibility,
  setResizeHelper,
} from 'JS/redux/actions/helper';
import { setHelperVisible } from 'JS/redux/actions/footer';
// assets
import './Helper.scss';

type Props = {
  auth: {
    isAuthenticated: Function,
  },
  footerVisible: boolean,
  isVisible: boolean,
  setResizeHelper: Function,
  setHelperVisibility: Function,
  uploadOpen: boolean,
}


class Helper extends Component<Props> {
  state = {
    helperMenuOpen: false,
    showPopup: false,
  };

  /**
    * @param {}
    * subscribe to store to update state
  */
  componentDidMount() {
    const { auth } = this.props;
    window.addEventListener('resize', this._resize);

    auth.isAuthenticated().then((response) => {
      const guideShown = localStorage.getItem('guideShown');
      if (!guideShown && response) {
        this.setState({ showPopup: true });
        localStorage.setItem('guideShown', true);
        this._toggleIsVisible();
        this._toggleMenuView();
      }
    });
  }

  /**
    * @param {}
    * update store
  */
  _toggleIsVisible = () => {
    const { isVisible } = this.props;
    this.props.setHelperVisibility(!isVisible);
  }

  /**
    * @param {}
    * toggles menu view
  */
  _toggleMenuView = () => {
    const { helperMenuOpen } = this.state;
    setHelperVisible(!helperMenuOpen);
    this.setState({ helperMenuOpen: !helperMenuOpen });
  }

  /**
    * @param {}
    * update store to risize component
  */
  _resize = () => {
    this.props.setResizeHelper();
  }

  render() {
    const {
      helperMenuOpen,
      showPopup,
    } = this.state;
    const {
      footerVisible,
      uploadOpen,
    } = this.props;
    // declare css here
    const menuCSS = classNames({
      Helper__menu: helperMenuOpen,
      hidden: !helperMenuOpen,
      'Helper__men--footer-open': footerVisible,
    });
    const helperButtonCSS = classNames({
      Helper__button: true,
      'Helper__button--open': helperMenuOpen,
      'Helper__button--bottom': uploadOpen && !helperMenuOpen,
    });

    return (
      <div className="Helper">
        { showPopup
        && (
          <>
            <div className="Helper__prompt">
              <div>
                <p>Use the guide to view tips on how to use Gigantum. The guide can be toggled in the Help menu below.</p>
              </div>

              <div>
                <button
                  type="button"
                  className="button--green"
                  onClick={() => this.setState({ showPopup: false })}
                >
                  Got it!
                </button>
              </div>
            </div>
            <div className="Helper__prompt-pointer" />
          </>
        )}

        <div
          className={helperButtonCSS}
          onClick={() => this._toggleMenuView()}
          role="presentation"
        />

        <div className={menuCSS}>
          <a
            className="Helper__menu-feedback"
            href="https://feedback.gigantum.com"
            rel="noreferrer"
            target="_blank"
          >
            <h5>Feedback</h5>
            <div className="Helper__feedback-button" />
          </a>
          <a
            className="Helper__menu-discussion"
            href="https://spectrum.chat/gigantum"
            rel="noreferrer"
            target="_blank"
          >
            <h5>Discuss</h5>
            <div
              className="Helper__discussion-button"
            />
          </a>
          <a
            className="Helper__menu-docs"
            href="https://docs.gigantum.com/docs"
            rel="noreferrer"
            target="_blank"
          >
            <h5>Docs</h5>
            <div className="Helper__docs-button" />
          </a>

          <div className="Helper__menu-guide">
            <h5>Guide</h5>
            <label
              htmlFor="guideShown"
              className="Helper-guide-switch"
            >
              <input
                id="guideShown"
                type="checkbox"
                defaultChecked={!localStorage.getItem('guideShown')}
                onClick={() => this._toggleIsVisible()}
              />
              <span className="Helper-guide-slider" />
            </label>
          </div>
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  resize: state.helper.resize,
  isVisible: state.helper.isVisible,
  footerVisible: state.helper.footerVisible,
  uploadOpen: state.footer.uploadOpen,
});

const mapDispatchToProps = dispatch => ({
  setHelperVisibility,
  setResizeHelper,
});

export default connect(mapStateToProps, mapDispatchToProps)(Helper);
