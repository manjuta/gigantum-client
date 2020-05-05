import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
// store
import store from 'JS/redux/store';
// config
import config from 'JS/config';
// assets
import './Tooltip.scss';

type Props = {
  isVisible: boolean,
  section: string,
}

class Tooltip extends Component<Props> {
  state = {
    toolTipExpanded: false,
    isVisible: store.getState().helper,
  };

  static getDerivedStateFromProps(props, state) {
    const { toolTipExpanded } = state;
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
    @param {} -
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
  _hideTooltip = (evt) => {
    const { section } = this.props;
    const { toolTipExpanded } = this.state;
    if (toolTipExpanded
       && (evt.target.className.indexOf(section) === -1)
    ) {
      this.setState({ toolTipExpanded: false });
    }

    ReactTooltip.hide(this[`Tooltip_${section}`]);
  }

  /**
   *  @param {event} evt
   *  shows tooltip box when clicked
  */
  showToolTip = (evt) => {
    const { section } = this.props;
    evt.stopPropagation();
    ReactTooltip.show(this[`tooltip_${section}`]);
  }

  render() {
    const { toolTipExpanded } = this.state;
    const { isVisible, section } = this.props;
    const place = (section === 'descriptionOverview') ? 'right' : null;
    // declare css here
    const toolTipCSS = classNames({
      Tooltip: isVisible,
      hidden: !isVisible,
      [section]: true,
      isSticky: store.getState().labbook.isSticky,
    });
    const toggleCSS = classNames({
      Tooltip__toggle: true,
      [section]: true,
      'Tooltip__toggle--active': toolTipExpanded,
    });

    return (
      <div className={toolTipCSS}>
        <div
          className={toggleCSS}
          data-tip={config.getTooltipText(section)}
          ref={(ref) => { this[`tooltip_${section}`] = ref; }}
          onClick={evt => this.showToolTip(evt)}
          role="presentation"
          data-event="click focus"
        >
          { !toolTipExpanded
            && (
            <div className="Tooltip__glow-container">
              <div className="Tooltip__glow-ring-outer">
                <div className="Tooltip__glow-ring-inner" />
              </div>
            </div>
            )
          }
        </div>

        <ReactTooltip
          place={place}
        />

      </div>
    );
  }
}

const mapStateToProps = state => ({
  isVisible: state.helper.isVisible,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Tooltip);
