// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// components
import ActivityDetails from 'Components/shared/activity/ActivityDetails';
// assets
import './ActivityCard.scss';

/**
  @param {Object} props
  logic if the card should show by default or not
  @return {Boolean}
*/
const shouldShowDetails = (props) => {
  const { node } = props.edge;
  const { show, detailObjects } = node;
  const detailsHasShow = detailObjects.filter(details => details.show).length !== 0;

  return (show && detailsHasShow);
};

export default class ActivityCard extends Component {
  state = {
    showExtraInfo: shouldShowDetails(this.props),
    show: true,
    isOver: false,
  }

  /**
    @param {string} timestamp
    if input is undefined. current time of day is used
    inputs a time stamp and return the time of day HH:MM am/pm
    @return {string}
  */
  _getTimeOfDay = (timestamp) => {
    const time = (timestamp !== undefined) ? new Date(timestamp) : new Date();
    const hour = (time.getHours() % 12 === 0) ? 12 : time.getHours() % 12;
    const minutes = (time.getMinutes() > 9) ? time.getMinutes() : `0${time.getMinutes()}`;
    const ampm = time.getHours() >= 12 ? 'pm' : 'am';

    return `${hour}:${minutes}${ampm}`;
  }

  /**
    @param {}
    * determines the appropriate margins for cards when compressing
    @return {object}
  */
  _processCardStyle = () => {
    const activityCardStyle = {};
    const { props } = this;

    if (props.isCompressed) {
      if (!props.isExpandedHead && !props.isExpandedEnd) {
        activityCardStyle.marginTop = '-7.5px';
        activityCardStyle.marginBottom = '-7.5px';
      } else if (props.isExpandedHead) {
        const distance = props.attachedCluster.length - 1;
        const calculatedMargin = distance * 7.5;

        activityCardStyle.marginTop = `${calculatedMargin}px`;
        activityCardStyle.marginBottom = '-7.5px';
      } else if (props.isExpandedEnd) {
        const distance = props.attachedCluster.length - 1;
        const calculatedMargin = distance * 7.5;

        activityCardStyle.marginTop = '-7.5px';
        activityCardStyle.marginBottom = `${calculatedMargin}px`;
      }
    }

    return activityCardStyle;
  }

  /**
    @param {Boolean} isOver
    sets state for side bar to compress on hover
  */
  _expandCollapseSideBar = (isOver) => {
    const { props } = this;
    props.compressExpanded(props.attachedCluster, !isOver);

    this.setState({ isOver });
  }


  render() {
    const { props, state } = this;
    const { node } = props.edge;
    const type = node.type && node.type.toLowerCase();
    const expandedHeight = props.attachedCluster
      ? 110 * (props.attachedCluster.length - 1)
      : 0;
    const expandedBarHeight = state.isOver
      ? expandedHeight - ((props.attachedCluster.length - 1) * 15)
      : expandedHeight;
    const margin = state.isOver
      ? ((props.attachedCluster.length - 1) * 7.5)
      : 0;

    // declare style here
    const activityCardStyle = this._processCardStyle();
    const expandedStyle = props.attachedCluster && {
      height: `${expandedBarHeight}px`,
      margin: `${margin}px 0 0 0`,
    };

    if (props.isFirstCard && props.attachedCluster) {
      expandedStyle.top = '2px';
    }
    // declare css here
    const activityCardCSS = classNames({
      'ActivityCard card': state.showExtraInfo,
      'ActivityCard ActivityCard--collapsed card': !state.showExtraInfo,
      'ActivityCard--faded': props.hoveredRollback > props.position,
      ActivityCard__expanded: props.isExpandedNode,
      ActivityCard__compressed: props.isCompressed && !props.isExpandedEnd,
    });
    const titleCSS = classNames({
      'ActivityCard__title flex flex--row justify--space-between': true,
      open: state.showExtraInfo || (type === 'note' && state.show),
      closed: !state.showExtraInfo || (type === 'note' && !state.show),
    });

    return (
      <div className="ActivityCard__container column-1-span-9">
        <div className={activityCardCSS} style={activityCardStyle}>

          <div
            className={`ActivityCard__badge ActivityCard__badge--${type}`}
            title={type}
          />

          <div className="ActivityCard__content">

            <div
              className={titleCSS}
              onClick={() => this.setState({ show: !state.show, showExtraInfo: !state.showExtraInfo })}
            >
              <div className="ActivityCard__stack">

                <p className="ActivityCard__time">
                  {this._getTimeOfDay(props.edge.node.timestamp)}
                </p>

                <div className="ActivityCard__user" />
              </div>

              <h6 className="ActivityCard__commit-message">
                <b>{`${props.edge.node.username} - `}</b>
                { props.edge.node.message }
              </h6>
            </div>
            {
              (state.showExtraInfo && ((type !== 'note') || state.show))
                && (
                  <ActivityDetails
                    sectionType={props.sectionType}
                    edge={props.edge}
                    show={state.showExtraInfo}
                    key={`${node.id}_activity-details`}
                    node={node}
                  />
                )
            }
          </div>
        </div>
      </div>
    );
  }
}
