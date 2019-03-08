import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
// store
import store from 'JS/redux/store';
// config
import config from 'JS/config';
// assets
import './Tooltip.scss';

class Tooltip extends Component {
  constructor(props) {
    super(props);
    const { isVisible } = store.getState().helper;
    this.state = {
      toolTipExpanded: false,
      isVisible,
    };
    this._hideTooltip = this._hideTooltip.bind(this);
  }


  static getDerivedStateFromProps(props, state) {
    const toolTipExpanded = state.toolTipExpanded;
    return {
      ...state,
      toolTipExpanded: props.isVisible ? toolTipExpanded : false,
    };
  }

  /**
    * @param {}
    * subscribe to store to update state
  */
  componentDidMount() {
    window.addEventListener('click', this._hideTooltip);
  }
  /**
    @param {}
    unsubscribe from event listeners
  */
  componentWillUnmount() {
    window.removeEventListener('click', this._hideTooltip);
  }
  /**
   *  @param {event} evt
   *  closes tooltip box when tooltip is open and the tooltip has not been clicked on
   *
  */
  _hideTooltip(evt) {
    if (this.state.toolTipExpanded && evt.target.className.indexOf(this.props.section) === -1) {
      this.setState({ toolTipExpanded: false });
    }
  }

  render() {
    const { section } = this.props;
    const toolTipCSS = classNames({
      Tooltip: this.props.isVisible,
      hidden: !this.props.isVisible,
      [section]: true,
      isSticky: store.getState().labbook.isSticky,
    });
    const toggleCSS = classNames({
      Tooltip__toggle: true,
      [section]: true,
      active: this.state.toolTipExpanded,
    });
    const messsageCSS = classNames({
      Tooltip__message: this.state.toolTipExpanded,
      hidden: !this.state.toolTipExpanded,
      [section]: true,
    });
    const pointerCSS = classNames({
      Tooltip__pointer: this.state.toolTipExpanded,
      hidden: !this.state.toolTipExpanded,
      [section]: true,
    });
    return (
      <div className={toolTipCSS}>

        <div
          className={toggleCSS}
          onClick={() => this.setState({ toolTipExpanded: !this.state.toolTipExpanded })}>
          {
            !this.state.toolTipExpanded &&
            <div className="Tooltip__glow-container">
              <div className="Tooltip__glow-ring-outer">
                <div className="Tooltip__glow-ring-inner" />
              </div>
            </div>
          }
        </div>


        <div className={pointerCSS} />
        <div className={messsageCSS}>
          {config.getTooltipText(section)}
        </div>

      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  isVisible: state.helper.isVisible,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Tooltip);
